import { createGlobalState, useStorage } from "@vueuse/core";
import { ref } from "vue";
import { z } from "zod";
import { useLogger } from "../composables/useLogger";
import config from "../config/config.json";
import { getCountryInfo } from "../helpers/countries/getCountryInfo";
import { getMacAppStoreUrl } from "../helpers/getMacAppStoreUrl";
import { readParams } from "../helpers/readParams";
import { useDeploymentInfo } from "./useDeploymentInfo";
import { isBillingActive } from "./usePaddleBillingCheckout";

const log = useLogger();

export const useStoreState = createGlobalState(() => {
  const isLoadedForCoupon = ref<null | string>(null); // don't use storage for this because we want to reload on page refresh
  // The price lookup didn't come back. Not persisted (like
  // isLoadedForCoupon): a fresh page load should try again rather than
  // inherit last time's outcome. Deliberately just a flag and not a reason
  // — the page says only that there is no price to show, which is all we
  // actually know. Whether this visitor can buy is Paddle's question to
  // answer at the checkout, not ours to pre-empt here.
  const loadFailed = ref(false);
  // Price ids to sell against when we have no prices. The backend returns
  // them when Paddle declines to price for the visitor's location, so the
  // buy buttons keep working with the price left blank.
  const checkoutPriceIds = ref<Record<string, string>>({});
  const countryCode = useStorage("popclip-store-countryCode", "");
  const countryName = useStorage("popclip-store-countryName", "");
  const paddleProducts = useStorage("popclip-store-paddleProducts", {});
  // The load key (coupon|country) the stored products were priced for, so a
  // page can tell whether remembered prices are the ones it wants (e.g. the
  // buy page during a sale) before fresh ones arrive.
  const paddleProductsKey = useStorage("popclip-store-paddleProductsKey", "");
  // Paddle's identifiers for the payment methods its checkout offers at the
  // quoted price and location ("card", "paypal", "upi", ...), in Paddle's
  // order. Persisted and replaced alongside the prices it came with. Says
  // nothing about the browser: "apple_pay" is listed regardless.
  const paymentMethods = useStorage<string[]>(
    "popclip-store-paymentMethods",
    [],
  );
  // const masPrice = useStorage("popclip-store-masPrice", "");
  // const masUrl = useStorage(
  //   "popclip-store-masUrl",
  //   getMacAppStoreUrl(config.mas.appId, config.mas.slug),
  // );
  const lizhiStandardPrice = ref(config.lizhi.standardPrice);
  const lizhiLifetimePrice = ref(config.lizhi.lifetimePrice);
  const lizhiUrl = ref(config.lizhi.storeUrl);
  return {
    countryCode,
    countryName,
    paddleProducts,
    paddleProductsKey,
    paymentMethods,
    // masPrice,
    // masUrl,
    lizhiStandardPrice,
    lizhiLifetimePrice,
    lizhiUrl,
    isLoadedForCoupon,
    loadFailed,
    checkoutPriceIds,
  };
});

const ZPaddlePrice = z.object({
  gross: z.number(),
  net: z.number(),
  tax: z.number(),
});

const ZPaddleCoupon = z.object({
  code: z.string(),
  discount: z.number(),
});

const ZPaddleProduct = z.object({
  product_id: z.number(),
  product_title: z.string(),
  currency: z.string(),
  vendor_set_prices_included_tax: z.boolean(),
  price: ZPaddlePrice,
  list_price: ZPaddlePrice,
  applied_coupon: z.union([
    z.array(z.unknown()).length(0).length(0),
    ZPaddleCoupon,
  ]),
});
type PaddleProduct = z.infer<typeof ZPaddleProduct>;

const ZProductOffering = z.object({
  vendor: z.literal("paddle"),
  product: z.string(), // e.g. "popclip"
  paddleData: ZPaddleProduct,
});

const ZProductsResult = z.object({
  countryCode: z.string(),
  products: z.record(z.string(), ZProductOffering),
});
type ProductsResult = z.infer<typeof ZProductsResult>;

// The coupon to price with: one named in the URL (#coupon=) wins, otherwise
// the caller's default (the buy page passes the running sale's code, if any).
// Paddle applies only one discount, so the two never combine.
export function effectiveCoupon(defaultCoupon?: string | null) {
  return readParams().get("coupon") ?? defaultCoupon ?? "";
}

// The key a load with this default coupon would use: the coupon actually
// priced with and the #country= override. Pipe-joined; neither a coupon nor
// a country code contains a pipe.
export function storeLoadKey(defaultCoupon?: string | null) {
  return `${effectiveCoupon(defaultCoupon)}|${readParams().get("country") ?? ""}`;
}

// The key of the latest load a page asked for, or null if none has yet.
// Responses arrive in any order, so this decides which one gets applied.
let wantedKey: string | null = null;

// don't call this during SSR!
//
// The default coupon is part of the guard key below, so moving from the buy
// page (sale prices) to a page that loads without it (offer, student discount)
// re-fetches undiscounted prices rather than reusing the sale ones.
//
// `background` is for the site-wide prefetch in the layout (StoreLoader). It
// runs on every page, alongside any load the page itself makes, and must
// never win: on a fresh load of the buy page both fire at once, and if the
// prefetch's undiscounted prices arrived last they would replace the sale
// prices. So a background load is skipped once a page has asked for prices,
// and its result is dropped if a page asks while it is in flight. Page loads
// apply only if they are still the latest one asked for.
export async function loadStore(
  defaultCoupon?: string | null,
  { background = false } = {},
) {
  const store = useStoreState();

  const coupon = effectiveCoupon(defaultCoupon);
  const country = readParams().get("country") ?? "";
  // Guard key includes country so a #country= change re-fetches (it doesn't
  // change the coupon).
  const loadKey = storeLoadKey(defaultCoupon);
  if (background) {
    if (wantedKey !== null) return;
  } else {
    wantedKey = loadKey;
  }
  if (store.isLoadedForCoupon.value === loadKey) {
    log(
      `Store already loaded for ${store.countryCode.value} (key '${loadKey}')`,
    );
    return;
  }
  const isCurrent = () =>
    background ? wantedKey === null : wantedKey === loadKey;

  if (isBillingActive()) {
    return loadStoreBilling(store, coupon, country, loadKey, isCurrent);
  }

  log("Loading prices", { coupon });
  const fetchResponse = await fetch(
    `${config.pilotmoon.frontendRoot}/store/getProducts?products=${Object.keys(config.pilotmoon.paddleProducts)}&coupons=${coupon}`,
  );
  if (!isCurrent()) return;
  if (!fetchResponse.ok) {
    log("Failed to load prices");
    store.loadFailed.value = true;
    return;
  }
  const productData = ZProductsResult.parse(await fetchResponse.json());
  if (!isCurrent()) return;
  const countryInfo = getCountryInfo(productData.countryCode);
  store.countryCode.value = productData.countryCode;
  store.countryName.value = countryInfo.countryName;
  store.paddleProducts.value = preprocessProducts(productData);
  store.paddleProductsKey.value = loadKey;
  store.loadFailed.value = false;
  store.isLoadedForCoupon.value = loadKey;
  log(`Prices loaded for ${store.countryCode.value}`);
}

const ZProcessedProduct = z.object({
  product: z.string().optional(), // product slug, e.g. "popclip_2year"
  isDiscounted: z.boolean(),
  isTaxed: z.boolean(),
  displayPrice: z.string(),
  displayListPrice: z.string(),
  displayDiscount: z.string().nullable(),
  coupon: z.string().nullable(),
  // Classic-only fields
  productId: z.number().optional(),
  priceNet: z.number().optional(), // net unit price, for computing offer-discounted prices client-side
  // Billing-only fields; displayPrice is tax-inclusive where Paddle
  // anchors the price as gross (tax_mode "location"), and taxNote carries
  // the "inc. tax" caption when so
  priceId: z.string().optional(),
  taxNote: z.string().nullable().optional(),
  // unit total in minor units, for computing offer-discounted prices
  // client-side (a percentage discount scales the total linearly)
  priceMinor: z.number().optional(),
  currency: z.string(),
});
type ProcessedProduct = z.infer<typeof ZProcessedProduct>;

// --- Paddle Billing store loading --------------------------------------------

const ZBillingTotals = z.object({
  subtotal: z.string(),
  discount: z.string(),
  tax: z.string(),
  total: z.string(),
});

const ZBillingProductsResult = z.object({
  countryCode: z.string(),
  currencyCode: z.string(),
  discount: z
    .object({ id: z.string(), code: z.string().nullable() })
    .nullable(),
  // optional so the page still loads against a backend that predates it
  paymentMethods: z.array(z.string()).optional(),
  products: z.record(
    z.string(),
    z.object({
      vendor: z.literal("paddle_billing"),
      product: z.string(),
      priceId: z.string(),
      taxMode: z.string(),
      taxRate: z.string(),
      unitTotals: ZBillingTotals, // amounts in minor units, e.g. "1299"
      formattedUnitTotals: ZBillingTotals,
    }),
  ),
});

// Format an amount given in the currency's minor unit (e.g. cents), taking
// care of zero-decimal currencies like JPY.
export function formatMinorUnits(amountMinor: number, currencyCode: string) {
  const format = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  });
  const digits = format.resolvedOptions().maximumFractionDigits ?? 2;
  return format.format(amountMinor / 10 ** digits);
}

// The one failure the backend can be specific about arrives as a JSON body,
// `{"error":{"code":"country_not_supported"},"priceIds":{...}}` — Paddle
// declining to price for this location, with the ids to sell against anyway.
// Every other failure — a 5xx, the plain-text bodies the backend's generic
// error handler produces, a body that isn't JSON at all — reads as null.
const ZErrorBody = z.object({
  error: z.object({ code: z.string() }),
  priceIds: z.record(z.string(), z.string()).optional(),
});
async function readErrorBody(response: Response) {
  try {
    const parsed = ZErrorBody.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function loadStoreBilling(
  store: ReturnType<typeof useStoreState>,
  coupon: string,
  // #country=XX forces the displayed prices to that country instead of
  // geolocating the caller's IP — for testing localized prices without a
  // VPN. The same param also pre-fills the checkout's country (see
  // usePaddleBillingCheckout), which the buyer can change on the first
  // checkout screen. Allowed in production.
  country: string,
  loadKey: string,
  // false once this load has been superseded; checked after every await,
  // before anything is written to the store
  isCurrent: () => boolean,
) {
  const sandbox = useDeploymentInfo().isLocalhost;
  const endpoint = sandbox
    ? config.pilotmoon.frontendRoot_sandbox
    : config.pilotmoon.frontendRoot;
  const mode = sandbox ? "test" : "live";
  log("Loading prices (billing)", { coupon, mode, country });
  // clear any previous outcome so a reload shows the loading state
  store.loadFailed.value = false;
  let fetchResponse: Response;
  try {
    fetchResponse = await fetch(
      `${endpoint}/store/getProductsBilling?products=${Object.keys(config.pilotmoon.paddleProducts)}&coupon=${coupon}&mode=${mode}${
        country ? `&country=${encodeURIComponent(country)}` : ""
      }`,
    );
  } catch (e) {
    // fetch itself rejected (offline, DNS, CORS)
    log("Failed to load prices (billing)", e);
    if (!isCurrent()) return;
    store.loadFailed.value = true;
    return;
  }
  if (!isCurrent()) return;
  if (!fetchResponse.ok) {
    const body = await readErrorBody(fetchResponse);
    if (!isCurrent()) return;
    store.loadFailed.value = true;
    if (body?.error.code === "country_not_supported") {
      log("No price available for this location");
      // Forget what a previous visit remembered. These are localStorage
      // values, so without this a visitor who once loaded prices elsewhere
      // keeps seeing them — possibly in the wrong currency — long after
      // they stopped being this visitor's prices. Showing no price is
      // honest; showing a stale one isn't.
      store.paddleProducts.value = {};
      store.paddleProductsKey.value = loadKey;
      store.paymentMethods.value = [];
      store.countryCode.value = "";
      store.countryName.value = "";
      // ...but keep selling: the price ids don't depend on the country, so
      // the buy buttons still open a checkout and Paddle decides.
      store.checkoutPriceIds.value = body.priceIds ?? {};
      // A settled answer, not a hiccup: mark it loaded so we don't refetch
      // until the coupon/country key actually changes.
      store.isLoadedForCoupon.value = loadKey;
      return;
    }
    log("Failed to load prices (billing)");
    // Keep any prices already loaded (almost certainly still right for this
    // visitor) and leave isLoadedForCoupon unset so a reload re-fetches.
    return;
  }
  const result = ZBillingProductsResult.parse(await fetchResponse.json());
  if (!isCurrent()) return;

  const processed: Record<string, ProcessedProduct> = {};
  const configuredProducts = config.pilotmoon.paddleProducts;
  for (const [key, product] of Object.entries(result.products)) {
    const subtotalMinor = Number(product.unitTotals.subtotal);
    const discountMinor = Number(product.unitTotals.discount);
    const taxMinor = Number(product.unitTotals.tax);
    const isDiscounted = discountMinor > 0;
    // Display depends on the price's tax mode:
    // - "external" (exclusive): net prices with tax added at checkout,
    //   presented like the Classic site: display the (possibly discounted)
    //   subtotal, caption "+ tax" when tax was computed.
    // - otherwise ("location"/"internal", tax-inclusive): the advertised
    //   price includes tax. Display the total (it's simply the price you
    //   pay); caption "+ tax" only where the preview has no tax, i.e.
    //   exclusive-anchored countries where checkout may add it.
    // All display strings are formatted here from the minor-unit amounts
    // (browser-locale Intl) rather than using Paddle's pre-formatted
    // strings, whose conventions differ (e.g. Paddle renders CNY as
    // "59.00 元" where Intl gives "CN¥59.00", or "¥59.00" for zh locales).
    const exclusive = product.taxMode === "external";
    let displayPrice: string;
    let displayListPrice: string;
    let taxNote: string | null;
    if (!exclusive) {
      displayPrice = formatMinorUnits(
        Number(product.unitTotals.total),
        result.currencyCode,
      );
      // undiscounted total: tax is charged on the discounted subtotal, so
      // reconstruct as subtotal * (1 + rate)
      displayListPrice = formatMinorUnits(
        Math.round(subtotalMinor * (1 + Number(product.taxRate))),
        result.currencyCode,
      );
      taxNote = taxMinor > 0 ? null : "+ tax";
    } else {
      displayPrice = formatMinorUnits(
        subtotalMinor - discountMinor,
        result.currencyCode,
      );
      displayListPrice = formatMinorUnits(subtotalMinor, result.currencyCode);
      taxNote = taxMinor > 0 ? "+ tax" : null;
    }
    const productConfig =
      configuredProducts[key as keyof typeof configuredProducts];
    processed[key] = {
      product: key,
      isDiscounted,
      isTaxed: false, // superseded by taxNote in the billing path
      displayPrice,
      displayListPrice,
      displayDiscount: isDiscounted
        ? formatMinorUnits(discountMinor, result.currencyCode)
        : null,
      coupon: isDiscounted ? result.discount?.code ?? null : null,
      priceId: product.priceId,
      taxNote,
      // numeric counterpart of displayPrice, for client-side discount math
      priceMinor: exclusive
        ? subtotalMinor - discountMinor
        : Number(product.unitTotals.total),
      currency: result.currencyCode,
    };
  }

  store.countryCode.value = result.countryCode;
  store.countryName.value = result.countryCode
    ? getCountryInfo(result.countryCode).countryName
    : "";
  store.paddleProducts.value = z.record(ZProcessedProduct).parse(processed);
  store.paddleProductsKey.value = loadKey;
  store.paymentMethods.value = result.paymentMethods ?? [];
  store.loadFailed.value = false;
  store.checkoutPriceIds.value = {};
  store.isLoadedForCoupon.value = loadKey;
  log(`Prices loaded (billing) for '${store.countryCode.value}'`);
}

export function formatCurrency(value: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  }).format(value);
}

// Strip a trailing ".00" from a formatted price, e.g. "US$12.00" -> "US$12".
export function roundPrice(price: string): string {
  return price.endsWith(".00") ? price.slice(0, -3) : price;
}

function preprocessProducts(productData: ProductsResult) {
  const result: Record<string, ProcessedProduct> = {};
  const configuredProducts = config.pilotmoon.paddleProducts;
  for (const [key, product] of Object.entries(productData.products)) {
    let coupon: string | null = null;
    let displayDiscount: string | null = null;
    if (!Array.isArray(product.paddleData.applied_coupon)) {
      coupon = product.paddleData.applied_coupon.code ?? null;
      displayDiscount = formatCurrency(
        product.paddleData.applied_coupon.discount,
        product.paddleData.currency,
      );
    }
    const displayPrice = formatCurrency(
      product.paddleData.price.net,
      product.paddleData.currency,
    );
    let displayListPrice: string;
    let isDiscounted = false;
    let message: string | null = null;
    const productConfig =
      configuredProducts[
        productData.products[key].product as keyof typeof configuredProducts
      ];
    displayListPrice = formatCurrency(
      product.paddleData.list_price.net,
      product.paddleData.currency,
    );
    isDiscounted =
      product.paddleData.price.net < product.paddleData.list_price.net;
    const isTaxed =
      product.paddleData.price.net < product.paddleData.price.gross;
    const processed: ProcessedProduct = {
      isTaxed,
      isDiscounted,
      displayPrice,
      displayListPrice,
      displayDiscount,
      coupon,
      productId: product.paddleData.product_id,
      priceNet: product.paddleData.price.net,
      currency: product.paddleData.currency,
    };
    result[key] = processed;
  }
  const parsedResult = z.record(ZProcessedProduct).parse(result);
  console.log({ parsedResult });
  return parsedResult;
}

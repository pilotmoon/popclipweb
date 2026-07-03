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
  const countryCode = useStorage("popclip-store-countryCode", "");
  const countryName = useStorage("popclip-store-countryName", "");
  const paddleProducts = useStorage("popclip-store-paddleProducts", {});
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
    // masPrice,
    // masUrl,
    lizhiStandardPrice,
    lizhiLifetimePrice,
    lizhiUrl,
    isLoadedForCoupon,
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

// don't call this during SSR!
export async function loadStore() {
  const store = useStoreState();

  const coupon = readParams().get("coupon") ?? "";
  if (store.isLoadedForCoupon.value === coupon) {
    log(
      `Store already loaded for ${store.countryCode.value} and coupon '${coupon}'`,
    );
    return;
  }

  if (isBillingActive()) {
    return loadStoreBilling(store, coupon);
  }

  log("Loading prices", { coupon });
  const fetchResponse = await fetch(
    `${config.pilotmoon.frontendRoot}/store/getProducts?products=${Object.keys(config.pilotmoon.paddleProducts)}&coupons=${coupon}`,
  );
  if (!fetchResponse.ok) {
    log("Failed to load prices");
    return;
  }
  const productData = ZProductsResult.parse(await fetchResponse.json());
  const countryInfo = getCountryInfo(productData.countryCode);
  store.countryCode.value = productData.countryCode;
  store.countryName.value = countryInfo.countryName;
  store.paddleProducts.value = preprocessProducts(productData);
  store.isLoadedForCoupon.value = coupon;
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
  message: z.string().nullable(),
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
  discount: z.object({ id: z.string(), code: z.string().nullable() }).nullable(),
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

async function loadStoreBilling(
  store: ReturnType<typeof useStoreState>,
  coupon: string,
) {
  const sandbox = useDeploymentInfo().isLocalhost;
  const endpoint = sandbox
    ? config.pilotmoon.frontendRoot_sandbox
    : config.pilotmoon.frontendRoot;
  const mode = sandbox ? "test" : "live";
  log("Loading prices (billing)", { coupon, mode });
  const fetchResponse = await fetch(
    `${endpoint}/store/getProductsBilling?products=${Object.keys(config.pilotmoon.paddleProducts)}&coupon=${coupon}&mode=${mode}`,
  );
  if (!fetchResponse.ok) {
    log("Failed to load prices (billing)");
    return;
  }
  const result = ZBillingProductsResult.parse(await fetchResponse.json());

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
      coupon: isDiscounted ? (result.discount?.code ?? null) : null,
      message:
        productConfig && "message" in productConfig
          ? productConfig.message
          : null,
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
  store.isLoadedForCoupon.value = coupon;
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
    if ("message" in productConfig) {
      message = productConfig.message;
    }
    if ("fullPrice" in productConfig) {
      displayListPrice = formatCurrency(
        productConfig.fullPrice,
        productConfig.fullPriceCurrency,
      );
      isDiscounted = product.paddleData.price.net < productConfig.fullPrice;
    } else {
      displayListPrice = formatCurrency(
        product.paddleData.list_price.net,
        product.paddleData.currency,
      );
      isDiscounted =
        product.paddleData.price.net < product.paddleData.list_price.net;
    }
    const isTaxed =
      product.paddleData.price.net < product.paddleData.price.gross;
    const processed: ProcessedProduct = {
      isTaxed,
      isDiscounted,
      displayPrice,
      displayListPrice,
      displayDiscount,
      coupon,
      message,
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

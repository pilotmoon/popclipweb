import { createGlobalState, useStorage } from "@vueuse/core";
import { ref } from "vue";
import { z } from "zod";
import { useLogger } from "../composables/useLogger";
import config from "../config/config.json";
import { getCountryInfo } from "../helpers/countries/getCountryInfo";
import { getMacAppStoreUrl } from "../helpers/getMacAppStoreUrl";
import { useDeploymentInfo } from "./useDeploymentInfo";
import { readParams } from "../helpers/readParams";

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
  const lizhiPrice = useStorage("popclip-store-lizhiPrice", config.lizhi.price);
  const lizhiUrl = useStorage("popclip-store-lizhiUrl", config.lizhi.storeUrl);
  return {
    countryCode,
    countryName,
    paddleProducts,
    // masPrice,
    // masUrl,
    lizhiPrice,
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

  const coupon = readParams().get("coupon") ?? ""
  if (store.isLoadedForCoupon.value === coupon) {
    log(`Store already loaded for ${store.countryCode.value} and coupon '${coupon}'`);
    return;
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
  isDiscounted: z.boolean(),
  isTaxed: z.boolean(),
  displayPrice: z.string(),
  displayListPrice: z.string(),
  displayDiscount: z.string().nullable(),
  coupon: z.string().nullable(),
  message: z.string().nullable(),
  productId: z.number(),
});
type ProcessedProduct = z.infer<typeof ZProcessedProduct>;

function formatCurrency(value: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  }).format(value);
}

function preprocessProducts(productData: ProductsResult) {
  const result: Record<string, ProcessedProduct> = {};
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
    const productConfig = config.pilotmoon.paddleProducts[productData.products[key].product];
    if (productConfig.fullPrice) {
      displayListPrice = formatCurrency(
        productConfig.fullPrice,
        productConfig.fullPriceCurrency,
      );
      message = productConfig.message;
      isDiscounted = product.paddleData.price.net < productConfig.fullPrice;      
    }
    else {
      displayListPrice = formatCurrency(
        product.paddleData.list_price.net,
        product.paddleData.currency,
      );
      isDiscounted =
        product.paddleData.price.net < product.paddleData.list_price.net;
    }
    const isTaxed = product.paddleData.price.net < product.paddleData.price.gross;
    const processed: ProcessedProduct = {
      isTaxed,
      isDiscounted,
      displayPrice,
      displayListPrice,
      displayDiscount,
      coupon,
      message,
      productId: product.paddleData.product_id,
    };
    result[key] = processed;
  }
  const parsedResult = z.record(ZProcessedProduct).parse(result);
  console.log({ parsedResult });
  return parsedResult;
}

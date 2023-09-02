import { createGlobalState, useSessionStorage } from "@vueuse/core";
import { getMacAppStoreUrl } from "../helpers/getMacAppStoreUrl";
import { getCountryInfo } from "../helpers/countries/getCountryInfo";
import config from "../config/config.json";
import { z } from "zod";

export const useStoreState = createGlobalState(
  () => {
    const isLoaded = useSessionStorage("popclip-store-isLoaded", false);
    const countryCode = useSessionStorage("popclip-store-countryCode", "");
    const countryName = useSessionStorage("popclip-store-countryName", "");
    const paddlePrice = useSessionStorage("popclip-store-paddlePrice", "");
    const masPrice = useSessionStorage("popclip-store-masPrice", "");
    const masUrl = useSessionStorage(
      "popclip-store-masUrl",
      getMacAppStoreUrl(config.mas.appId, config.mas.slug),
    );
    const lizhiPrice = useSessionStorage(
      "popclip-store-lizhiPrice",
      config.lizhi.price,
    );
    const lizhiUrl = useSessionStorage(
      "popclip-store-lizhiUrl",
      config.lizhi.storeUrl,
    );
    return {
      countryCode,
      countryName,
      paddlePrice,
      masPrice,
      masUrl,
      lizhiPrice,
      lizhiUrl,
      isLoaded,
    };
  },
);

const ZPricesResponse = z.object({
  country: z.string(),
  prices: z.object({
    paddle: z.object({
      currency: z.string(),
      amount: z.number(),
      formatted: z.string(),
    }),
  }),
});

// don't call this during SSR!
export async function loadStore() {
  const store = useStoreState();
  if (store.isLoaded.value) {
    console.log(`Store already loaded for ${store.countryCode}`);
    return;
  }
  const apiRoot = window.location.hostname === "localhost"
    ? config.pilotmoon.apiRoot
    : "/api";
  const fetchResponse = await fetch(
    apiRoot + "/frontend/store/getPrices?product=" + config.pilotmoon.product,
  );
  const { country, prices } = ZPricesResponse.parse(await fetchResponse.json());
  if (country) {
    const countryInfo = getCountryInfo(country);
    store.countryCode.value = country;
    store.countryName.value = countryInfo.countryName;
    store.paddlePrice.value = prices.paddle.formatted;
    store.masUrl.value = getMacAppStoreUrl(
      config.mas.appId,
      config.mas.slug,
      countryInfo.appStoreCode,
    );
  }
  console.log(`Prices loaded for ${store.countryCode}`);
}

import { createGlobalState, useStorage } from "@vueuse/core";
import { ref } from "vue";
import { z } from "zod";
import { getMacAppStoreUrl } from "../helpers/getMacAppStoreUrl";
import { getCountryInfo } from "../helpers/countries/getCountryInfo";
import { useDeploymentInfo } from '../composables/useDeploymentInfo'
import { useLogger } from "../composables/useLogger";
import config from "../config/config.json";

const log = useLogger();

export const useStoreState = createGlobalState(
  () => {
    const isLoaded = ref(false); // don't use storage for this because we want to reload on page refresh
    const countryCode = useStorage("popclip-store-countryCode", "");
    const countryName = useStorage("popclip-store-countryName", "");
    const paddlePrice = useStorage("popclip-store-paddlePrice", "");
    const masPrice = useStorage("popclip-store-masPrice", "");
    const masUrl = useStorage(
      "popclip-store-masUrl",
      getMacAppStoreUrl(config.mas.appId, config.mas.slug),
    );
    const lizhiPrice = useStorage(
      "popclip-store-lizhiPrice",
      config.lizhi.price,
    );
    const lizhiUrl = useStorage(
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
    log(`Store already loaded for ${store.countryCode.value}`);
    return;
  }
  log(`Loading prices...`);
  const apiRoot = useDeploymentInfo().isLocalhost ? config.pilotmoon.apiRoot : "/api";
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
    store.isLoaded.value = true;
  }
  log(`Prices loaded for ${store.countryCode.value}`);
}

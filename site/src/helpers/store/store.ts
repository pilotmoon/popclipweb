// common module for loading and storing price and purchase information

import { reactive, computed } from 'vue'
import { getCountryInfo } from './getCountryInfo'
import { getMacAppStoreUrl } from './getMacAppStoreUrl'
import * as config from '../../config/config.json'

export const store = reactive({
  countryCode: "",
  countryName: "",
  paddlePrice: "",
  masPrice: "",
  masUrl: getMacAppStoreUrl(config.mas.appId, config.mas.slug),
  lizhiPrice: config.lizhi.price,
  lizhiUrl: config.lizhi.storeUrl,
});

export const isLoaded = computed(() => store.countryCode !== "");

// don't call this during SSR!
export async function loadStore() {
  if (isLoaded.value) {
    console.log(`Store already loaded for ${store.countryCode}`);
    return;
  }
  const apiRoot = window.location.hostname === "localhost" ? config.pilotmoon.apiRoot : "/api";
  const fetchResponse = await fetch(
    apiRoot + "/frontend/store/getPrices?product=" + config.pilotmoon.product
  );
  const { country, prices } = await fetchResponse.json();
  if (country) {
      const countryInfo = getCountryInfo(country);
      store.countryCode = country;
      store.countryName = countryInfo.countryName;
      store.paddlePrice = prices.paddle.formatted;
      store.masUrl = getMacAppStoreUrl(config.mas.appId, config.mas.slug, countryInfo.appStoreCode);
  }
  console.log(`Prices loaded for ${store.countryCode}`);
}
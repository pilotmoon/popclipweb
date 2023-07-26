// common module for loading and storing price and purchase information

import { reactive, computed } from 'vue'
import { getCountryInfo } from './getCountryInfo'
import { getMacAppStoreUrl } from './getMacAppStoreUrl'
import * as config from '../../config.json'

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
  const fetchResponse = await fetch("https://api.pilotmoon.com/webhooks/store/getPrices?product=" + config.pilotmoon.product);
  const { country, prices } = await fetchResponse.json();
  console.log("prices", prices);
  if (country) {
      const countryInfo = getCountryInfo(country);
      console.log("getCountryInfo", countryInfo);
      store.countryCode = country;
      store.countryName = countryInfo.countryName;
      store.paddlePrice = prices.paddle.formatted;
      store.masUrl = getMacAppStoreUrl(config.mas.appId, config.mas.slug, countryInfo.appStoreCode);
  }
  console.log(`Store loaded for ${store.countryCode}`, store);
}
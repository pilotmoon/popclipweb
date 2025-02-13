/*

Notes

The itunesCountries.json file lists all the countries that have an iTunes store, and the country codes that iTunes uses.
I generated this file manually (with help from ChatGPT) by scraping the search drop-down
at <https://tools.applemediaservices.com/app-store/>

The paddleCountries.json file lists country codes and country names according to Paddle. JSON copied from
<https://developer.paddle.com/reference/29717a4e58630-supported-countries> then inverted using ChatGPT.
Some country names manually edited.

*/

import itunesCountries from "./itunesCountries.json";
import paddleCountries from "./paddleCountries.json";

// Given a two letter country code, return the corresponding app store info.
export function getCountryInfo(countryCode: unknown) {
  if (typeof countryCode !== "string") {
    throw new Error("Country cose must be string");
  }
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    throw new Error(`Invalid country code: ${countryCode}`);
  }
  const itunesInfo = itunesCountries.find((x) => x[1] === countryCode);
  return {
    appStoreCode: String(itunesInfo?.[1] ?? ""),
    countryName: String(
      paddleCountries[countryCode as keyof typeof paddleCountries] ?? "",
    ),
  };
}

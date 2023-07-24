/*

Notes

The itunes.json file lists all the countries that have an iTunes store, and the country codes that iTunes uses.
I generated this file manually (with help from ChatGPT) by scraping the search drop-down
at <https://tools.applemediaservices.com/app-store/>

The paddle.json file lists country codes and country names according to Paddle. JSON copied from
<https://developer.paddle.com/reference/29717a4e58630-supported-countries>.



*/

import { data } from "./appstore.json";

function masLink(appId: number, cc?: any) {
  if (typeof cc === "string" && cc.length === 2) {
    cc = cc.toLowerCase() + "/";
  } else {
    cc = "";
  }
  return `https://apps.apple.com/${cc}app/popclip/id${appId}?mt=12`;
}

// Given a two letter country code, return the corresponding app store info.
export function masInfo(appId: any, countryCode: any) {
  if (typeof appId !== "number") {
    throw new Error(`Invalid appId: ${appId}`);
  }
  console.log(`Looking up MAS info for country code ${countryCode}`);
  const info = data.find((x) => x[1] === countryCode);
  console.log(`Found MAS info: ${JSON.stringify(info)}`);
  return {
    url: masLink(appId, info?.[1]),
  };
}

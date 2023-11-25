export function getMacAppStoreUrl(
  appId: string,
  slug: string,
  countryCode?: string,
) {
  if (typeof countryCode === "string" && countryCode.length === 2) {
    countryCode = `${countryCode.toLowerCase()}/`;
  } else {
    countryCode = "";
  }
  return `https://apps.apple.com/${countryCode}app/${slug}/id${appId}?mt=12`;
}

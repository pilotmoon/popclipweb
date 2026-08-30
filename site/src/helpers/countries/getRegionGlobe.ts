import { Globe, GlobeAfrica, GlobeAmericas, GlobeAsia, GlobeEurope } from "@vicons/fa";

/*

Picks the globe icon shown beside the "Regional pricing applied" note, so the
face of the globe matches the part of the world whose prices are on screen.

Only regionally-priced countries need an entry here — that note is the only
place the icon renders, and it only renders when `isRegionallyPriced` is true.
The country list itself lives in regionalPricing.json, which is generated from
the sibling popclip-pricing repo; if a country is added there without being
added here, it falls back to the plain wireframe globe rather than breaking.

Countries that straddle two continents are placed where the bulk of the land
(and the population) sits: Turkey, Georgia, Armenia and Azerbaijan under Asia.

*/

const REGIONS = {
  africa: ["DZ", "EG", "GH", "KE", "MA", "NG", "TZ", "ZA"],
  americas: ["AR", "BR", "CL", "CO", "EC", "GT", "HN", "MX", "PE"],
  asia: [
    "AM", "AZ", "BD", "CN", "GE", "ID", "IN", "IQ", "JO", "KG", "KH",
    "KZ", "LB", "LK", "MY", "PH", "PK", "TH", "TJ", "TR", "UZ", "VN",
  ],
  europe: ["AL", "BA", "MD", "ME", "MK", "RS", "UA"],
} as const;

const GLOBES = {
  africa: GlobeAfrica,
  americas: GlobeAmericas,
  asia: GlobeAsia,
  europe: GlobeEurope,
} as const;

// Flattened once at module load: country code -> region key.
const regionOf = new Map<string, keyof typeof REGIONS>(
  Object.entries(REGIONS).flatMap(([region, codes]) =>
    codes.map((code) => [code, region as keyof typeof REGIONS] as const),
  ),
);

// Given a two letter country code, return the globe icon component to show
// next to that country's prices. Falls back to the generic globe.
export function getRegionGlobe(countryCode: unknown) {
  if (typeof countryCode !== "string") {
    return Globe;
  }
  const region = regionOf.get(countryCode.toUpperCase());
  return region ? GLOBES[region] : Globe;
}

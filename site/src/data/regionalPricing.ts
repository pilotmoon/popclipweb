import data from "./regionalPricing.json";

// Countries with below-full-tier stickers, grouped by discount level. The JSON
// is generated from the pricing tool's tier config (`bun run emit` in the
// sibling popclip-pricing repo) — edit tiers there, not here.
export default data;

const discounted = new Set(data.tiers.flatMap((t) => t.countries));

// Whether a country gets regional (below-full) pricing — drives the
// "Regional pricing applied" indicator next to price displays.
export function isRegionallyPriced(countryCode: string): boolean {
  return discounted.has(countryCode);
}

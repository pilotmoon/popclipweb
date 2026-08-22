// Ordering helpers shared by the directory front page and the category
// pages, so the two can never drift apart on how names compare.
import type { ExtInfo } from "./data/extensionInfo";

export function byName(a: ExtInfo, b: ExtInfo) {
  return a.name.localeCompare(b.name);
}

// popularity rank ascending (1 first); unranked extensions last, and
// alphabetical within a tie so the order is stable
export function byRank(a: ExtInfo, b: ExtInfo) {
  const ra = a.popularity?.rank ?? Number.MAX_SAFE_INTEGER;
  const rb = b.popularity?.rank ?? Number.MAX_SAFE_INTEGER;
  return ra - rb || byName(a, b);
}

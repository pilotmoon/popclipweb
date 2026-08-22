// The directory front page's tuning values, gathered in one place.
// (The per-category and per-extension knobs -- frontPageLimit, priority,
// flagship, category, unlisted, firstListed -- live in the backend and
// are edited in aero; these are the site-wide settings.)

// how many extensions the Newly Added section shows
export const NEWLY_ADDED_LIMIT = 6;

// a category section shows at most this many entries, unless its record
// carries a frontPageLimit override -- except that flagships and new
// entries always fit, even past the limit
export const DEFAULT_CATEGORY_LIMIT = 8;

// this many guaranteed slots per category section for the NEWEST new
// entries; further new entries stay eligible for the random selection
export const NEW_PER_CATEGORY_LIMIT = 2;

// of the slots a category section has left after flagships and new
// entries, this many are serendipity picks: a daily-rotating random
// draw from members the popularity ranking would NOT have surfaced, so
// nothing is permanently buried below the fold. the remaining slots go
// to the highest-ranked members.
export const WILDCARD_PER_CATEGORY_LIMIT = 1;

// how long an extension counts as newly listed: drives both the New!
// badge on entries and the new-entries grouping in category sections
export const NEW_WINDOW_DAYS = 21;

// the Featured box at the top of the front page rotates daily through
// the extensions that have an mp4 demo and sit in this top fraction of
// the popularity ranking. automatic, with no per-extension flag: the
// pool is large enough to rotate and keeps pace with new demos for free.
// (mp4 only, by decision: gifs are excluded even where one exists.)
export const FEATURED_RANK_FRACTION = 0.75;

// demo aspect ratios vary (the house format is 2:1; a few are ultra-
// wide strips). the Featured box admits width/height within this range
export const FEATURED_MIN_ASPECT = 1.5;
export const FEATURED_MAX_ASPECT = 2.6;

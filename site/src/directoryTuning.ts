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

// The directory front page's tuning values, gathered in one place.
// (The per-category and per-extension knobs -- frontPageLimit, priority,
// flagship, category, unlisted, firstListed -- live in the backend and
// are edited in aero; these are the site-wide settings.)

// how many extensions the Newly Added section shows
export const NEWLY_ADDED_LIMIT = 5;

// a category section shows at most this many entries, unless its record
// carries a frontPageLimit override -- except that flagships and new
// entries always fit, even past the limit
export const DEFAULT_CATEGORY_LIMIT = 10;

// at most this many New! entries per category section (a daily-rotating
// random pick when there are more)
export const NEW_PER_CATEGORY_LIMIT = 3;

// how long an extension counts as newly listed: drives both the New!
// badge on entries and the new-entries grouping in category sections
export const NEW_WINDOW_DAYS = 30;

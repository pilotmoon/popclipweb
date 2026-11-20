// A site-wide sale: a Paddle discount code applied automatically on the buy
// page, both to the displayed prices and to the checkout. It is a discount,
// not a price change, so it behaves like any other coupon: Paddle applies one
// discount per checkout, and a code entered at the checkout (or passed as
// #coupon=) replaces the sale discount rather than stacking on top of it.
//
// The code must exist as a discount in both the sandbox and live Paddle
// accounts. Give it an expiry in Paddle as well, as a backstop to the window
// below.
export const SALE = {
  label: "Black Friday Sale: 30% off",
  coupon: "BLACKFRIDAY2026",
  // First and last days of the sale, inclusive. Days count "anywhere on
  // Earth": the sale starts as soon as the first day has begun somewhere
  // (UTC+14) and runs until the last day has ended everywhere (UTC-12), so
  // nobody sees it start late or end early in their own time zone.
  firstDay: "2026-11-20",
  lastDay: "2026-12-01",
};

const DAY_MS = 24 * 60 * 60 * 1000;
// Midnight at the start of firstDay in UTC+14, the earliest time zone.
const SALE_START = Date.parse(`${SALE.firstDay}T00:00:00+14:00`);
// Midnight at the end of lastDay in UTC-12, the latest time zone.
const SALE_END = Date.parse(`${SALE.lastDay}T00:00:00-12:00`) + DAY_MS;

// The sale code to apply now, or null outside the sale window. The same
// window applies locally as on the live site. Client-side only: depends on
// the current time.
export function activeSaleCoupon(now = new Date()): string | null {
  const t = now.getTime();
  return t >= SALE_START && t < SALE_END ? SALE.coupon : null;
}

// The last day of the sale for display, e.g. "1 December" (or "December 1",
// following the browser's locale like the prices do). A calendar date, not
// an instant, so it is formatted in UTC to keep the day from shifting.
export function saleLastDayLabel(): string {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${SALE.lastDay}T00:00:00Z`));
}

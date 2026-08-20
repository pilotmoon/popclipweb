<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import { z } from "zod";
import config from "./config/config.json";
import { loadStore, useStoreState, formatMinorUnits, roundPrice } from "./composables/useStoreState";
import { useDeploymentInfo } from "./composables/useDeploymentInfo";
import { useLogger } from "./composables/useLogger";
import { usePaddleBillingCheckout } from "./composables/usePaddleBillingCheckout";
import { formatDate } from "./helpers/formatters";
import { getFlagEmoji } from "./helpers/getFlagEmoji";
import { infoBlock, supportMailtoHref } from "./helpers/supportMailto";
import paddleCountries from "./helpers/countries/paddleCountries.json";
import { isRegionallyPriced } from "./data/regionalPricing";
import { GlobeAmericas } from "@vicons/fa";
import { Icon } from "@vicons/utils";
import OfferCard from "./OfferCard.vue";
import PreCheckoutDialog from "./PreCheckoutDialog.vue";
import { useSessionStorage } from "@vueuse/core";

const log = useLogger();
const store = useStoreState();
const sandbox = useDeploymentInfo().isLocalhost;
const { openCheckout } = usePaddleBillingCheckout();

// ---- signed offer params ------------------------------------------------

// The signed params are minted by PopClip. We don't verify the signature here
// (the secret lives only in PopClip and the Twix backend) — we just check the
// params are present and well-formed to decide whether to show the offer. The
// real verification happens server-side when a coupon is requested.
interface SignedParams {
  id: string;
  sig: string;
  offer: string; // signed campaign (e.g. "upgrade")
  rpd?: string; // Mac App Store receipt purchase date (optional)
  lpd?: string; // license purchase date (optional)
  lxd?: string; // license expiry date (optional)
  lkh?: string; // license key hash (optional)
  scc?: string; // App Store storefront country, ISO alpha-3 (optional)
  edu?: string; // claimed educational institution (student offer, optional)
  cou?: string; // claimed country, ISO alpha-2 (student offer, optional)
  isd?: string; // link issue date (self-service-minted offers, optional)
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Minimal HTML escape for user-supplied text interpolated into v-html strings.
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// The merged fragment + query params (fragment preferred), so PopClip can
// use whichever is convenient.
function readOfferParams(): URLSearchParams {
  const hash = (window.location.hash || "").replace(/^#/, "");
  const p = new URLSearchParams(window.location.search);
  for (const [k, v] of new URLSearchParams(hash)) p.set(k, v);
  return p;
}

// Offers whose wording doesn't reference a purchase/expiry date, so a link
// with just id + offer + sig is valid.
const DATELESS_OFFERS = ["support", "free1year", "student"];

// Read the signed offer params. The dates are optional, but at least one
// must be present for the upgrade page to make sense (the support offer
// needs none).
function readSignedParams(): SignedParams | null {
  const p = readOfferParams();
  const params: SignedParams = {
    id: p.get("id") ?? "",
    sig: p.get("sig") ?? "",
    offer: p.get("offer") ?? "",
  };
  for (const key of ["rpd", "lpd", "lxd"] as const) {
    const v = p.get(key);
    if (v) params[key] = v;
  }
  const lkh = p.get("lkh");
  if (lkh) params.lkh = lkh;
  const scc = p.get("scc");
  if (scc) params.scc = scc;
  const edu = p.get("edu");
  if (edu) params.edu = edu;
  const cou = p.get("cou");
  if (cou) params.cou = cou;
  const isd = p.get("isd");
  if (isd) params.isd = isd;
  const dates = [params.rpd, params.lpd, params.lxd];
  const datesOk = (DATELESS_OFFERS.includes(params.offer) || dates.some((d) => d)) && dates.every((d) => !d || DATE_RE.test(d));
  const ok = params.id.length > 0 && params.sig.length > 0 && params.offer.length > 0 && datesOk;
  return ok ? params : null;
}

const status = ref<"loading" | "valid" | "invalid">("loading");
const purchaseDate = ref<string>("");
const purchaseYear = ref<string>("");
const signedParams = ref<SignedParams | null>(null);
// The page URL, captured on mount (never at module scope — this component is
// server-rendered at build time, where there is no `window`).
const pageUrl = ref<string>("");
const couponError = ref(false);
const busyOffer = ref<string | null>(null);
// Disables the buy/renew buttons while any claim is in flight — only one checkout
// can be started at a time, so this backstops the busyOffer guard against double-clicks.
const anyBusy = computed(() => busyOffer.value !== null);
const regionallyPriced = computed(() => isRegionallyPriced(store.countryCode.value));

onMounted(() => {
  pageUrl.value = window.location.href;
  const params = readSignedParams();
  if (params) {
    signedParams.value = params;
    purchaseDate.value = params.lpd ?? params.rpd ?? "";
    purchaseYear.value = (params.lpd ?? params.rpd)?.slice(0, 4) ?? "";
    status.value = "valid";
    loadStore(); // populate prices for display
    // Unsigned email/name params (PopClip passes the licensee's existing
    // details for convenience) seed the pre-checkout dialog. They are not
    // part of the signature and are never sent to the backend.
    const p = readOfferParams();
    const emailParam = p.get("email");
    if (emailParam) storedEmail.value = emailParam;
    const nameParam = p.get("name");
    if (nameParam) storedName.value = nameParam;
  } else {
    status.value = "invalid";
  }
  // React to #country= changes without a reload (matches the Buy page);
  // loadStore's guard no-ops when the coupon+country key is unchanged.
  const reloadOnHashChange = () => {
    if (status.value === "valid") loadStore();
  };
  window.addEventListener("hashchange", reloadOnHashChange);
  onUnmounted(() => window.removeEventListener("hashchange", reloadOnHashChange));
});

// ---- pre-checkout dialog --------------------------------------------------

// Same capture and session persistence as the Buy page: the dialog always
// shows before checkout (when enabled), prefilled with the remembered or
// passed-in values.
const storedName = useSessionStorage("popclip-license-name", "");
const storedEmail = useSessionStorage("popclip-license-email", "");
const showDialog = ref(false);
const pendingClaim = ref<string | null>(null);
const initialName = computed(() => storedName.value || "");
const initialEmail = computed(() => storedEmail.value || "");

const CLAIM_TITLES: Record<string, string> = {
  lifetime50: "Buy Lifetime License",
  lifetime30: "Buy Lifetime License",
  lifetime25: "Buy Lifetime License",
  lifetime20: "Buy Lifetime License",
  freeLifetime: "Claim Lifetime License",
  free2year: "Claim Standard License", // the Mac App Store offer's free 2-year fallback
  standard50: "Buy Standard License",
  free1year: "Claim 1-Year License",
  renew2year: "Renew Standard License",
};
const dialogTitle = computed(() => {
  // renew2year is "Renew" only for a 2-year license holder — see isStandardRenewal.
  if (pendingClaim.value === "renew2year" && !isStandardRenewal.value) return "Buy Standard License";
  return CLAIM_TITLES[pendingClaim.value ?? ""] ?? "Buy PopClip License";
});

// The buyer details confirmed in the dialog (or taken straight from the
// stored values when the dialog is disabled), passed into the checkout.
interface BuyerDetails {
  email: string | null;
  name: string | null;
  ownerEmail: string | null;
}

async function detailsConfirmed(details: BuyerDetails) {
  storedEmail.value = details.email ?? "";
  if (details.name) storedName.value = details.name;
  showDialog.value = false;
  const claim = pendingClaim.value;
  pendingClaim.value = null;
  if (!claim) return;
  if (claim === "renew2year") await renewStandard(details);
  else await startClaim(claim, details);
}

function detailsCancelled() {
  showDialog.value = false;
  pendingClaim.value = null;
}

// customData for the checkout: the signed offer details plus the buyer's
// chosen license name / owner email from the dialog.
function checkoutCustomData(claim: string, details: BuyerDetails) {
  return {
    ...offerPassthrough(claim),
    ...(details.name ? { license_name: details.name } : {}),
    ...(details.ownerEmail ? { license_email: details.ownerEmail } : {}),
  };
}

// The price fields shown on a card, mirroring the Buy page: a struck-through original
// price (when discounted), the actual price (or "Free"), and a tax caption. The offer
// discount is applied at the Paddle checkout, so the discounted price is computed here
// from the regular price (the exact total still shows in the Paddle overlay). A
// percentage discount scales the price linearly, whether it's a tax-inclusive total
// or a net amount, so the displayed basis (priceMinor) works for both tax modes.
type PriceFields = Pick<CardData, "listPrice" | "priceLabel" | "priceIsDiscount" | "taxNote" | "discountNote">;

function discountPricing(product: "popclip_lifetime" | "popclip_2year" | "popclip_1year", percentOff: number): PriceFields {
  const p = store.paddleProducts.value[product];
  if (!p) return { priceLabel: "" };
  if (percentOff >= 100) {
    return { listPrice: roundPrice(p.displayPrice), priceLabel: "Free", priceIsDiscount: true };
  }
  const discountedMinor = Math.round(p.priceMinor * (1 - percentOff / 100));
  return {
    listPrice: percentOff > 0 ? roundPrice(p.displayPrice) : undefined,
    priceLabel: roundPrice(formatMinorUnits(discountedMinor, p.currency)),
    priceIsDiscount: false,
    taxNote: p.taxNote ?? undefined,
    discountNote: percentOff > 0 ? `${percentOff}% off` : undefined,
  };
}

function lifetimePricing(percentOff: number): PriceFields {
  return discountPricing("popclip_lifetime", percentOff);
}

// Full-price 2-year renewal pricing (no discount).
function twoYearPricing(): PriceFields {
  const p = store.paddleProducts.value.popclip_2year;
  if (!p) return { priceLabel: "" };
  return { priceLabel: roundPrice(p.displayPrice), priceIsDiscount: false, taxNote: p.taxNote ?? undefined };
}

// The free 2-year fallback (100% off popclip_2year via the `free2year` claim), mirroring
// oneYearPricing() below but for the 2-year product.
function freeTwoYearPricing(): PriceFields {
  const p = store.paddleProducts.value.popclip_2year;
  if (!p) return { priceLabel: "" };
  return { listPrice: roundPrice(p.displayPrice), priceLabel: "Free", priceIsDiscount: true };
}

// The 1-year license is offer-only (always given away at 100% off), so this only
// ever renders the "Free" branch of the same logic lifetimePricing(100) uses.
function oneYearPricing(): PriceFields {
  const p = store.paddleProducts.value.popclip_1year;
  if (!p) return { priceLabel: "" };
  return { listPrice: roundPrice(p.displayPrice), priceLabel: "Free", priceIsDiscount: true };
}

// License expiry (for the license-holder copy): the date, whether it has passed,
// and a human-readable form.
const today = new Date().toISOString().slice(0, 10);
const licenseExpiry = computed(() => signedParams.value?.lxd ?? "");
const licenseExpired = computed(() => licenseExpiry.value !== "" && licenseExpiry.value < today);
const formattedExpiry = computed(() => (licenseExpiry.value ? formatDate(licenseExpiry.value) : ""));

// License term from the signed purchase→expiry dates, rounded to the nearest
// whole year (1, 2, …), or null when a date is missing or the span rounds to
// zero. Nearest-year rounding sidesteps leap-day wrinkles, and only whole-year
// terms are sold anyway (same ms-based measure as licenseDeal above).
const licenseTermYears = computed<number | null>(() => {
  const sp = signedParams.value;
  if (!sp?.lpd || !sp?.lxd) return null;
  const ms = new Date(sp.lxd).getTime() - new Date(sp.lpd).getTime();
  const years = Math.round(ms / (365.25 * 24 * 60 * 60 * 1000));
  return years >= 1 ? years : null;
});

// "2-year PopClip license" when the term is known, else the plain "PopClip license".
// A digit rather than the word form ("two-year"), matching the card wording.
const licensePhrase = computed(() => {
  const y = licenseTermYears.value;
  return y !== null ? `${y}-year PopClip license` : "PopClip license";
});

// Only a 2-year (Standard) license holder genuinely "renews". 1-year licenses are
// free comps — those holders never paid — so they (and unknown terms) get "buy"
// wording everywhere the renewal purchase is mentioned.
const isStandardRenewal = computed(() => licenseTermYears.value === 2);

// The license-holder Lifetime deal. A license held alongside a Mac App Store receipt gets
// the MAS rate (30%), regardless of license term. Otherwise it's term-based: 25% off for
// 2-year licenses, 20% for 1-year, derived from the signed purchase→expiry span. Anything
// from 1.5 years up (including longer or indeterminate terms — e.g. no purchase date in
// the link) gets the 2-year rate.
const licenseDeal = computed(() => {
  const sp = signedParams.value;
  if (sp?.rpd) return { percent: 30, claim: "lifetime30" };
  if (sp?.lpd && sp?.lxd) {
    const ms = new Date(sp.lxd).getTime() - new Date(sp.lpd).getTime();
    const years = ms / (365.25 * 24 * 60 * 60 * 1000);
    if (years < 1.5) return { percent: 20, claim: "lifetime20" };
  }
  return { percent: 25, claim: "lifetime25" };
});

// ---- offer matrix -------------------------------------------------------

// A card shown on the page. `claim` is the backend deal opened when its CTA is clicked.
interface CardData {
  badge?: string;
  title: string;
  bullets: string[];
  listPrice?: string;
  priceLabel: string;
  priceIsDiscount?: boolean; // false for a plain full price (renewal)
  taxNote?: string; // tax caption after the price, e.g. "+ tax" (mirrors the Buy page)
  discountNote?: string; // brand-coloured "N% off" line under the price
  ctaLabel: string;
  ctaTheme?: "brand" | "alt";
  ctaSize?: "big" | "medium";
  footnote: string;
  claim: string;
  extraFeatures?: { icon: string; label: string }[]; // appended to the card's constant features row
}

// The secondary slot is either a full product card (e.g. the renewal) or a terse
// "alt" box (e.g. "support the app" / "free 2-year").
type SecondaryData =
  { kind: "card"; label: string; card: CardData } | { kind: "alt"; title: string; html: string; cta: { label: string; theme: "brand" | "alt"; claim: string } };

interface SegmentData {
  headline: string;
  intro: string; // may contain inline HTML (rendered with v-html)
  primary: CardData;
  secondary?: SecondaryData;
  faq: { heading: string; body: string };
  fineprint: string;
}

const SUPPORT_SUBJECT = "PopClip Offer Enquiry";

// The offer link embedded in the support mailto: the page URL plus the country the store
// resolved for this visitor, so support both sees which country was used and reproduces
// the same prices on opening the link. It's a computed rather than a one-shot capture
// because the country arrives asynchronously with the store — by the time anyone clicks
// through, it has resolved. The country goes in the fragment, not the query string,
// because that's where the price override is read from (see helpers/readParams.ts).
const offerLink = computed(() => {
  if (!pageUrl.value) return "";
  const country = store.countryCode.value;
  if (!country) return pageUrl.value;
  const url = new URL(pageUrl.value);
  const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));
  fragment.set("country", country);
  url.hash = fragment.toString();
  return url.href;
});

// Shared tail of every segment's fineprint. Built per-render (not a module constant) so it
// picks up offerLink once mounted. Unlike everywhere else on the site, the link is built
// from the raw helper rather than <SupportEmailLink>: the fineprint is an HTML string
// rendered with v-html, which can't host a component. That also means the `&` separating
// the mailto's query params has to be escaped by hand for the href attribute.
function fineprintTail(): string {
  const href = supportMailtoHref({
    subject: SUPPORT_SUBJECT,
    footer: infoBlock(offerLink.value, "Offer Link"),
  }).replaceAll("&", "&amp;");
  return `Questions?&nbsp;<a href="${href}">Contact support</a>.`;
}

// MAS receipts before this date are gated out of the app (matches PopClip's receipt cutoff);
// only these customers are offered the free 2-year fallback. More recent buyers aren't gated
// yet, so they get the upgrade offer only.
const GATED_BEFORE = "2019-01-01";
// The year before GATED_BEFORE, for the "bought PopClip in ${year} or earlier" FAQ copy below —
// derived so the wording can't drift out of sync with the actual cutoff date.
const GATED_BEFORE_YEAR = Number(GATED_BEFORE.slice(0, 4)) - 1;

// Shared shape for every "Lifetime License" primary card; only the badge/CTA
// wording/footnote/claim differ between the free and 30%-off offers.
function lifetimeCard(percent: number, opts: { badge: string; ctaLabel: string; footnote: string; claim: string }): CardData {
  return {
    badge: opts.badge,
    title: "Lifetime License",
    bullets: ["Lifetime free updates", "Never expires"],
    ...lifetimePricing(percent),
    ctaLabel: opts.ctaLabel,
    footnote: opts.footnote,
    claim: opts.claim,
  };
}

// Highlighted (green) features row note, used only on the Mac App Store upgrade offer —
// the paid upgrade is pitched there partly as supporting the app, which doesn't apply to
// the license-holder or support-granted offers.
const SUPPORTS_DEVELOPMENT = { icon: "🚀", label: "Supports ongoing app development" };

// MAS receipt bought 2023 or later: treated as a Lifetime holder, so the key is free.
function masFreeSegment(): SegmentData {
  return {
    headline: "Mac App Store Upgrade Offer",
    intro: `Thanks for being a PopClip user since <strong>${purchaseYear.value}</strong>. Your Mac App Store purchase qualifies for a free Lifetime License key.`,
    primary: lifetimeCard(100, {
      badge: "Your upgrade is free",
      ctaLabel: "Claim free Lifetime License",
      footnote: "No charge at checkout.",
      claim: "freeLifetime",
    }),
    secondary: {
      kind: "alt",
      title: "Want to support the app?",
      html: `Your Lifetime License is free to claim. But if you'd like to support PopClip's continued development, you can choose to pay for it at 30% off instead. Thank you! (<a href="/terms">terms</a>)`,
      cta: { label: "Buy Lifetime at 30% off", theme: "alt", claim: "lifetime30" },
    },
    faq: {
      heading: "Why do I need a license key?",
      body: "PopClip is moving from Mac App Store purchase detection to requiring license keys for all users. Because you bought PopClip from the Mac App Store in 2023 or later, your purchase qualifies for a free upgrade to a Lifetime License.",
    },
    fineprint: `Offer for your Mac App Store purchase dated ${purchaseDate.value}. ${fineprintTail()}`,
  };
}

// The 30%-off Lifetime card for the Mac App Store offer.
function masLifetimePrimary(): CardData {
  return lifetimeCard(30, {
    badge: "Your offer — 30% off Lifetime",
    ctaLabel: "Buy Lifetime License — 30% off",
    footnote: "One-time purchase.",
    claim: "lifetime30",
  });
}

// The "free 1-year instead" fallback offered alongside the 30% deal, for the support offer
// (ad hoc links with no receipt date). The Mac App Store offer uses freeTwoYearSecondary()
// below instead — a full-card presentation of the equivalent free 2-year fallback.
function freeOneYearAlt(): SecondaryData {
  return {
    kind: "alt",
    title: "Not able to pay right now?",
    html: `I don't want cost or payment issues to lock you out. Claim a <strong>free 1-Year License</strong> instead, for a year of updates. You can still claim a Lifetime discount later.`,
    cta: { label: "Claim a free 1-year license", theme: "alt", claim: "free1year" },
  };
}

// The "free 2-year instead" fallback for the Mac App Store upgrade offer, presented as a
// full secondary card (like renewalSecondary() below) rather than the terse alt box, using
// the `free2year` claim — same 100%-off mechanism as the support offer's free1year, just
// a 2-year term and full-card treatment for this flow.
function freeTwoYearSecondary(): SecondaryData {
  return {
    kind: "card",
    label: "or, if now is not a good time",
    card: {
      title: "Standard License",
      bullets: ["2 more years of free updates", "Keep the last version you receive"],
      ...freeTwoYearPricing(),
      ctaLabel: "Claim free 2-Year License",
      ctaTheme: "alt",
      ctaSize: "medium",
      footnote: "No charge at checkout.",
      claim: "free2year",
    },
  };
}

// Simpler "alt" box variant of the same free 2-year fallback (same claim, just the plain
// treatment previously used for free 1-year). Kept alongside freeTwoYearSecondary() for
// A/B experimentation, toggled by config.experiments.masFreeTwoYearAltBox.
function freeTwoYearAlt(): SecondaryData {
  return {
    kind: "alt",
    title: "Not able to pay right now?",
    html: `I don't want cost or payment issues to lock you out. Claim a <strong>free 2-year Standard License</strong> instead, for two more years of updates. You can still claim a Lifetime discount later.`,
    cta: { label: "Claim a free 2-year license", theme: "alt", claim: "free2year" },
  };
}

// MAS receipt bought before 2023: Lifetime at 30% off. The free 2-year fallback is only
// offered to customers already gated out of the app (bought before the receipt cutoff);
// more recent buyers who aren't gated yet get just the upgrade offer, like an expiring license.
function masDiscountSegment(freeTwoYear: boolean): SegmentData {
  // The two audiences are in different situations, so each gets its own FAQ. Gated
  // customers (pre-cutoff receipts) are already locked out of the latest version and see
  // the free 2-year card on this page, so their FAQ answers the payment question directly
  // and steers price-sensitive customers to the free option. Non-gated recent buyers still
  // have a working app and no free option on the page, so their FAQ explains what's coming
  // and that upgrading is optional for now.
  const faq = freeTwoYear
    ? {
        heading: "Why is this a paid upgrade?",
        body: `The latest version of PopClip is a paid upgrade for customers who bought the app from the Mac App Store in ${GATED_BEFORE_YEAR} or earlier. Your original purchase has included many years of free updates, and I hope it has given you good value. If this unexpected request for payment is a problem, please choose the free 2-year Standard License — you can keep using PopClip either way.

The license key replaces the awkward system of App Store purchase detection, which required the old App Store version to be installed first. (PopClip left the App Store in 2024.) If you choose the Lifetime License, it helps me keep maintaining and improving PopClip. Thank you for your understanding and support.`,
      }
    : {
        heading: "Do I need to upgrade now?",
        body: `Not yet — your Mac App Store purchase still unlocks the current version of PopClip. However, PopClip is moving to license keys for all users, replacing the awkward system of App Store purchase detection. (PopClip left the App Store in 2024.) This takes the form of a paid upgrade, arriving in stages by purchase date: the first stage, starting in PopClip 2026.7, covers purchases made in ${GATED_BEFORE_YEAR} or earlier, and a future update will reach your purchase date too.

You're welcome to upgrade now or wait until then. Either way, the Lifetime License is discounted in recognition of your original purchase. Buying it helps me keep maintaining and improving PopClip.`,
      };
  const seg: SegmentData = {
    headline: "Mac App Store Upgrade Offer",
    intro: `Thanks for being a PopClip user since <strong>${purchaseYear.value}</strong>. To move from your Mac App Store purchase to a Standalone edition license key, here is your upgrade offer:`,
    primary: { ...masLifetimePrimary(), extraFeatures: [SUPPORTS_DEVELOPMENT] },
    faq,
    fineprint: `Offer for your Mac App Store purchase dated ${purchaseDate.value}. ${fineprintTail()}`,
  };
  if (freeTwoYear) {
    seg.secondary = config.experiments.masFreeTwoYearAltBox ? freeTwoYearAlt() : freeTwoYearSecondary();
  }
  return seg;
}

// Generic support-granted discount: 20% off Lifetime, or a free 1-year, with
// no receipt or license dates — links are minted ad hoc, e.g. by support.
// Wording is deliberately generic.
function supportSegment(): SegmentData {
  return {
    headline: "PopClip Support Discount",
    intro: `Thanks for your interest in PopClip. Here is your discount offer:`,
    primary: lifetimeCard(20, {
      badge: "Your offer — 20% off Lifetime",
      ctaLabel: "Buy Lifetime License — 20% off",
      footnote: "One-time purchase.",
      claim: "lifetime20",
    }),
    secondary: freeOneYearAlt(),
    faq: {
      heading: "About this offer",
      body: "This discount link was provided to you by PopClip support. It can be used once, for a license for your own use.",
    },
    fineprint: fineprintTail(),
  };
}

// Extra Mac App Store upgrade discount, sent directly by Nick to customers in certain
// cases: 50% off Lifetime as the sole item, no free alternative. Presented within the
// support family (same headline/FAQ as the support offer), with a hybrid intro that
// acknowledges the receipt year — an rpd is required in the link (the backend claim
// and the fineprint reference it too).
function mas50Segment(): SegmentData {
  return {
    headline: "PopClip Support Discount",
    intro: `Thanks for being a PopClip user since <strong>${purchaseYear.value}</strong>. Here is your discount offer:`,
    primary: lifetimeCard(50, {
      badge: "Your offer — 50% off Lifetime",
      ctaLabel: "Buy Lifetime License — 50% off",
      footnote: "One-time purchase.",
      claim: "lifetime50",
    }),
    faq: {
      heading: "About this offer",
      body: "This discount link was provided to you by PopClip support. It can be used once, for a license for your own use.",
    },
    fineprint: `Offer for your Mac App Store purchase dated ${purchaseDate.value}. ${fineprintTail()}`,
  };
}

// The issued-for line in the student fineprint: the claimed details from the
// self-service form, presented data-style ('institution "X", country Y') so
// free-text institution names can't warp a sentence.
function studentIssueLine(): string {
  const sp = signedParams.value;
  if (!sp?.edu) return "";
  const country = sp.cou ? (paddleCountries as Record<string, string>)[sp.cou] ?? sp.cou : "";
  return `Student offer issued for institution "${escapeHtml(sp.edu)}"${country ? `, country ${escapeHtml(country)}` : ""}. `;
}

// Student discount: a half-price Standard License as the sole item. No Lifetime deal
// upfront — a Standard license fits the temporary nature of student status, and the
// buyer gets the usual 25% Lifetime upgrade offer when the license expires. Dateless
// and generically worded like the support offer, for ad hoc links.
function studentSegment(): SegmentData {
  return {
    headline: "PopClip Student Discount",
    intro: `Thanks for your interest in PopClip. Here is your student discount offer:`,
    primary: {
      badge: "Your offer — 50% off Standard + Lifetime discount",
      title: "Standard License",
      bullets: ["2 years of free updates", "Keep the last version you receive"],
      ...discountPricing("popclip_2year", 50),
      ctaLabel: "Buy Standard License — 50% off",
      footnote: "One-time purchase.",
      claim: "standard50",
      // highlighted row (same slot as the MAS card's supports-development
      // note): as a license holder they'll qualify for the standard 25%
      // Lifetime upgrade offer after buying
      extraFeatures: [{ icon: "⬆️", label: "Upgrade to Lifetime later for 25% off" }],
    },
    faq: {
      heading: "About this offer",
      body: `This student discount is for students in full-time education. The link can be used once, for a license for your own use.

Your purchase qualifies you for a 25% discount on a Lifetime License. After activation, you'll find the offer link in PopClip's settings.`,
    },
    // echo the claimed details back, data-style rather than sentence flow (a
    // gentle honesty nudge for the self-service form). Escaped: the fineprint
    // renders via v-html and the fragment isn't signature-checked client-side.
    fineprint: `${studentIssueLine()}${fineprintTail()}`,
  };
}

// Dedicated giveaway: a free 1-Year License offered as the sole item, with no Lifetime
// deal alongside it. Dateless and generically worded like the support offer, for ad hoc links.
function free1YearSegment(): SegmentData {
  return {
    headline: "PopClip Free License",
    intro: `Thanks for your interest in PopClip. Here's your free 1-year license:`,
    primary: {
      badge: "Your license is free",
      title: "1-Year License",
      bullets: ["1 year of free updates", "Keep the last version you receive"],
      ...oneYearPricing(),
      ctaLabel: "Claim free 1-Year License",
      footnote: "No charge at checkout.",
      claim: "free1year",
    },
    faq: {
      heading: "About this offer",
      body: "This free license link was provided just for you — please don't share it. It can be used once, for a license for your own personal use.",
    },
    fineprint: fineprintTail(),
  };
}

// Full-price 2-year renewal, offered as the secondary to an expired-license holder. It's a
// plain full-price purchase (no coupon), so it opens the checkout directly rather than going
// through getOfferCoupon — see renewStandard(). Renew-vs-buy wording: isStandardRenewal.
function renewalSecondary(): SecondaryData {
  const isRenewal = isStandardRenewal.value;
  return {
    kind: "card",
    label: isRenewal ? "or renew your Standard License" : "or buy a Standard License",
    card: {
      title: "Standard License",
      bullets: ["2 more years of free updates", "Keep the last version you receive"],
      ...twoYearPricing(),
      ctaLabel: isRenewal ? "Renew for 2 years" : "Buy for 2 years",
      ctaTheme: "alt",
      ctaSize: "medium",
      footnote: "One-time purchase.",
      claim: "renew2year",
    },
  };
}

// The Lifetime offer card for license holders — term-based discount (see licenseDeal).
function licenseLifetimePrimary(): CardData {
  const { percent, claim } = licenseDeal.value;
  return lifetimeCard(percent, {
    badge: `Your offer — ${percent}% off Lifetime`,
    ctaLabel: "Upgrade to Lifetime",
    footnote: "One-time purchase.",
    claim,
  });
}

// The few bits that distinguish the pure-license offer from the receipt+license offer.
// Everything else in the two license-style segments is identical.
interface LicenseVariant {
  introPrefix: string; // optional thanks-for-being-a-customer opening line
  fineprint: string;
}

// Plain license holder: framed purely as a Standalone license.
function licenseVariant(): LicenseVariant {
  return {
    introPrefix: ``,
    fineprint: `Offer for your license dated ${purchaseDate.value}. ${fineprintTail()}`,
  };
}

// License-style upgrade offer. The pure-license and receipt+license cases share identical
// copy bar the LicenseVariant bits. `expiring` / `expired` stay separate (their wording and
// secondary genuinely differ).
function expiringLicenseSegment(v: LicenseVariant): SegmentData {
  return {
    headline: "Lifetime Upgrade Offer",
    intro: `${v.introPrefix}Your current license expires on <strong>${formattedExpiry.value}</strong>. You don't need a new license yet, but you have the following upgrade offer:`,
    primary: licenseLifetimePrimary(),
    faq: {
      heading: "Why upgrade to Lifetime?",
      body: `Your current license will expire on ${formattedExpiry.value} and stop receiving new updates. A Lifetime License never expires and includes all future updates.`,
    },
    fineprint: v.fineprint,
  };
}

// As above, but the license has already expired: adds a full-price 2-year renewal as the secondary.
function expiredLicenseSegment(v: LicenseVariant): SegmentData {
  return {
    headline: "License Upgrade Offer",
    intro: `${v.introPrefix}Your ${licensePhrase.value} expired on <strong>${formattedExpiry.value}</strong>. ${isStandardRenewal.value ? "Upgrade or renew your license" : "Buy a new license"} to keep getting updates.`,
    primary: licenseLifetimePrimary(),
    secondary: renewalSecondary(),
    faq: {
      heading: "Why do I need a new license?",
      body: `Your current license has expired, so it no longer receives new updates. You'll need a new license to use the latest version and future updates. Alternatively, you can keep using the previous version indefinitely with your current license. You can download the previous version from the downloads page.`,
    },
    fineprint: v.fineprint,
  };
}

// ---- offer rule table -----------------------------------------------------

// Facts available to each rule's matcher/builder, derived once per evaluation so
// individual rules don't each need to re-derive them from signedParams/licenseExpired.
interface OfferContext {
  offer: string;
  rpd?: string;
  lxd?: string;
  expired: boolean;
}

interface OfferRule {
  name: string; // for debugging only
  matches(ctx: OfferContext): boolean;
  build(ctx: OfferContext): SegmentData;
}

// Rules are evaluated in order; the first whose `matches` returns true wins. Paid upgrades
// are a discounted Lifetime: 30% off for Mac App Store receipts (with or without a license
// key alongside), or the term-based license-holder rate (25% for 2-year, 20% for 1-year) —
// see licenseDeal. A pre-2023 receipt held alongside a license key is presented as a
// license upgrade with the receipt acknowledged. The license-only offer applies when
// there's no receipt, split by whether the key has expired.
const offerRules: OfferRule[] = [
  {
    // the generic support-granted discount has its own wording, regardless of dates
    name: "support",
    matches: (ctx) => ctx.offer === "support",
    build: () => supportSegment(),
  },
  {
    // dedicated single-item giveaway: the 1-year license only, no Lifetime deal
    name: "free1year",
    matches: (ctx) => ctx.offer === "free1year",
    build: () => free1YearSegment(),
  },
  {
    // support-granted extra MAS discount: 50% off Lifetime only (must precede the
    // rpd-matched rules below — mas50 links carry an rpd)
    name: "mas50",
    matches: (ctx) => ctx.offer === "mas50",
    build: () => mas50Segment(),
  },
  {
    // student discount: half-price Standard, or 20% off Lifetime
    name: "student",
    matches: (ctx) => ctx.offer === "student",
    build: () => studentSegment(),
  },
  {
    name: "mas-free",
    matches: (ctx) => !!ctx.rpd && ctx.rpd >= "2023-01-01",
    build: () => masFreeSegment(),
  },
  {
    // pre-2023 receipt + license key: the license offer, acknowledging the receipt
    name: "mas-receipt-with-license",
    matches: (ctx) => !!ctx.rpd && !!ctx.lxd,
    build: (ctx) => {
      const v = licenseVariant();
      return ctx.expired ? expiredLicenseSegment(v) : expiringLicenseSegment(v);
    },
  },
  {
    // free 2-year only for pre-cutoff customers (those already gated out of the app)
    name: "mas-discount",
    matches: (ctx) => !!ctx.rpd,
    build: (ctx) => masDiscountSegment(ctx.rpd! < GATED_BEFORE),
  },
  {
    // fallback: no receipt, the same 30% offer framed as a license upgrade
    name: "license-only",
    matches: () => true,
    build: (ctx) => {
      const v = licenseVariant();
      return ctx.expired ? expiredLicenseSegment(v) : expiringLicenseSegment(v);
    },
  },
];

const segment = computed<SegmentData>(() => {
  const sp = signedParams.value;
  const ctx: OfferContext = { offer: sp?.offer ?? "", rpd: sp?.rpd, lxd: sp?.lxd, expired: licenseExpired.value };
  const rule = offerRules.find((r) => r.matches(ctx));
  if (!rule) throw new Error("no offer rule matched"); // unreachable: "license-only" always matches
  return rule.build(ctx);
});

// FAQ body paragraphs, split on blank lines and rendered as separate <p>s so
// the spacing is a controlled margin rather than pre-line blank lines.
const faqParagraphs = computed(() =>
  segment.value.faq.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p),
);

const ZDiscountResponse = z.object({ discountId: z.string(), priceId: z.string() });

// The signed offer details passed through to the Paddle webhook for context/tracking.
function offerPassthrough(claim: string) {
  const sp = signedParams.value!;
  return {
    offer_origin_id: sp.id,
    offer: sp.offer,
    claim,
    receipt_purchase_date: sp.rpd,
    license_purchase_date: sp.lpd,
    license_expiry_date: sp.lxd,
    license_key_hash: sp.lkh,
    store_country_code: sp.scc,
    student_institution: sp.edu,
    student_country: sp.cou,
    offer_issue_date: sp.isd,
  };
}

// Route a card's CTA through the pre-checkout dialog first (when enabled); the
// confirmed details then flow into the claim/renewal checkout.
function onBuy(claim: string) {
  if (busyOffer.value) return;
  if (config.paddleBilling.preCheckout) {
    pendingClaim.value = claim;
    showDialog.value = true;
    return;
  }
  const details: BuyerDetails = {
    email: storedEmail.value || null,
    name: storedName.value || null,
    ownerEmail: null,
  };
  if (claim === "renew2year") renewStandard(details);
  else startClaim(claim, details);
}

// Ask the Twix backend for a discount for this claim within the signed offer (it
// verifies the signature and validates the claim), then open the Paddle checkout.
async function startClaim(claim: string, details: BuyerDetails) {
  if (!signedParams.value || busyOffer.value) return;
  couponError.value = false;
  busyOffer.value = claim;
  try {
    const base = sandbox ? config.pilotmoon.frontendRoot_sandbox : config.pilotmoon.frontendRoot;
    const sp = signedParams.value;
    const query = new URLSearchParams({
      id: sp.id,
      sig: sp.sig,
      offer: sp.offer,
      claim,
      mode: sandbox ? "test" : "live",
    });
    if (sp.rpd) query.set("rpd", sp.rpd);
    if (sp.lpd) query.set("lpd", sp.lpd);
    if (sp.lxd) query.set("lxd", sp.lxd);
    if (sp.lkh) query.set("lkh", sp.lkh);
    if (sp.scc) query.set("scc", sp.scc);
    if (sp.edu) query.set("edu", sp.edu);
    if (sp.cou) query.set("cou", sp.cou);
    if (sp.isd) query.set("isd", sp.isd);
    const res = await fetch(`${base}/store/getOfferCoupon?${query}`);
    if (!res.ok) throw new Error(`discount request failed: ${res.status}`);
    const { discountId, priceId } = ZDiscountResponse.parse(await res.json());
    // pass the signed offer details through to the Paddle webhook
    await openCheckout({
      priceId,
      discountId,
      email: details.email,
      customData: checkoutCustomData(claim, details),
    });
  } catch (e) {
    log("Failed to get upgrade discount", e);
    couponError.value = true;
  } finally {
    busyOffer.value = null;
  }
}

// The 2-year renewal is a plain full-price purchase (no discount), so it skips getOfferCoupon
// and opens the Paddle checkout directly for the Standard price (id from the loaded store).
async function renewStandard(details: BuyerDetails) {
  if (!signedParams.value || busyOffer.value) return;
  couponError.value = false;
  busyOffer.value = "renew2year";
  try {
    const priceId = store.paddleProducts.value.popclip_2year?.priceId;
    if (!priceId) throw new Error("popclip_2year product not loaded yet");
    await openCheckout({
      priceId,
      email: details.email,
      customData: checkoutCustomData("renew2year", details),
    });
  } catch (e) {
    log("Failed to start renewal checkout", e);
    couponError.value = true;
  } finally {
    busyOffer.value = null;
  }
}
</script>

<template>
  <PreCheckoutDialog
    :open="showDialog"
    :title="dialogTitle"
    :owner-email-option="config.paddleBilling.preCheckoutOwnerEmail"
    :initial-name="initialName"
    :initial-email="initialEmail"
    @confirm="detailsConfirmed"
    @cancel="detailsCancelled"
  />
  <div v-if="status === 'loading'" :class="$style.center">Checking your offer…</div>

  <div v-else-if="status === 'invalid'" :class="$style.center">
    <h2>Offer not available</h2>
    <p>This page shows a special upgrade offer for existing customers. The link doesn't contain a valid offer.</p>
    <p>
      If you reached here from PopClip, please try again, or
      <a href="/support">contact support</a>. Otherwise you can see the regular prices on the <a href="/buy">buy page</a>.
    </p>
  </div>

  <div v-else>
    <h1>{{ segment.headline }}</h1>
    <p :class="$style.intro" v-html="segment.intro"></p>

    <p v-if="couponError" :class="$style.error">
      Sorry, something went wrong preparing your offer. Please try again, or
      <a href="/support">contact support</a>.
    </p>

    <OfferCard v-bind="segment.primary" :busy="anyBusy" @buy="onBuy" />

    <div :class="store.isLoadedForCoupon !== null ? $style.infoLine : $style.infoLineLoading">
      <template v-if="store.isLoadedForCoupon !== null">
        {{ `Showing prices for ${getFlagEmoji(store.countryCode.value)} ${store.countryName.value}` }}
        <span v-if="regionallyPriced" :class="$style.regionalNote">
          ·
          <a href="/regional-pricing"
            ><Icon :class="$style.regionalIcon"><GlobeAmericas /></Icon> Regional pricing applied</a
          ></span
        >
      </template>
      <template v-else>Loading prices...</template>
    </div>

    <template v-if="segment.secondary">
      <template v-if="segment.secondary.kind === 'card'">
        <div :class="$style.orLabel">{{ segment.secondary.label }}</div>
        <OfferCard v-bind="segment.secondary.card" secondary :busy="anyBusy" @buy="onBuy" />
      </template>
      <div v-else :class="$style.alt">
        <div :class="$style.altTitle">{{ segment.secondary.title }}</div>
        <p :class="$style.altText" v-html="segment.secondary.html"></p>
        <AaButton :class="$style.altButton" @click="onBuy(segment.secondary.cta.claim)" :theme="segment.secondary.cta.theme" size="medium" :disabled="anyBusy">
          {{ segment.secondary.cta.label }}
        </AaButton>
      </div>
    </template>

    <div :class="$style.faq">
      <div :class="$style.faqHeading">{{ segment.faq.heading }}</div>
      <p v-for="(para, i) in faqParagraphs" :key="i" :class="$style.faqText">{{ para }}</p>
    </div>

    <p :class="$style.fineprint" v-html="segment.fineprint"></p>
  </div>
</template>

<style module>
.center {
  text-align: center;
}

.intro {
  text-align: left;
  margin: 0 auto 20px auto;
}

.error {
  text-align: left;
  margin: 0 auto 16px auto;
  color: var(--vp-c-danger-1);
}

.infoLine {
  text-align: center;
  margin-top: 18px;
}

.regionalNote {
  font-size: 0.85em;
}

/* Green for emphasis (matches the site's other green accents); the `.infoLine`
   prefix raises specificity above VitePress's `.vp-doc a` link color. */
.infoLine .regionalNote a {
  color: var(--vp-c-green-1);
}

/* Sit the glyph on the text baseline (icons render as inline SVG). */
.regionalIcon {
  vertical-align: -0.125em;
}

.infoLineLoading {
  text-align: center;
  margin-top: 18px;

  color: var(--vp-c-text-2);
}

/* Small connector between the Lifetime hero and the renewal card. */
.orLabel {
  text-align: center;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 18px auto 0 auto;
}

/* Terse secondary option: smaller, grey-bordered box with a real CTA. */
.alt {
  max-width: 26em;
  margin: 20px auto 0 auto;
  padding: 16px 18px;
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  text-align: center;
}

.altTitle {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

/* `.alt` prefix raises specificity above VitePress's `.vp-doc p` rule, which
   otherwise overrides line-height (28px) and margin. */
.alt .altText {
  font-size: 13px;
  line-height: 1.4;
  color: var(--vp-c-text-2);
  margin: 0 0 12px 0;
}

.altButton {
  text-decoration: none;
}

/* Short explanation of the upgrade */
.faq {
  max-width: 34em;
  margin: 32px auto 0 auto;
  text-align: center;
}

.faqHeading {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

/* `.faq` prefix raises specificity above VitePress's `.vp-doc p` rule. */
.faq .faqText {
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  margin: 0;
}

/* Narrow, consistent paragraph rhythm within the FAQ (and matched by the
   fineprint's margin below). */
.faq .faqText + .faqText {
  margin-top: 8px;
}

/* Doubled class raises specificity above VitePress's `.vp-doc p` rule, which
   otherwise overrides line-height (28px) and margin. The margin and tight
   line-height match the FAQ's paragraph rhythm, so the fineprint reads as a
   continuation rather than a separate block. */
.fineprint.fineprint {
  text-align: center;
  font-size: 12px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  margin: 8px auto 0 auto;
}
</style>

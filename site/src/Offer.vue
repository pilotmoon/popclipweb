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
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
const DATELESS_OFFERS = ["support"];

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
  const dates = [params.rpd, params.lpd, params.lxd];
  const datesOk = (DATELESS_OFFERS.includes(params.offer) || dates.some((d) => d)) && dates.every((d) => !d || DATE_RE.test(d));
  const ok = params.id.length > 0 && params.sig.length > 0 && params.offer.length > 0 && datesOk;
  return ok ? params : null;
}

const status = ref<"loading" | "valid" | "invalid">("loading");
const purchaseDate = ref<string>("");
const purchaseYear = ref<string>("");
const signedParams = ref<SignedParams | null>(null);
const couponError = ref(false);
const busyOffer = ref<string | null>(null);
// Disables the buy/renew buttons while any claim is in flight — only one checkout
// can be started at a time, so this backstops the busyOffer guard against double-clicks.
const anyBusy = computed(() => busyOffer.value !== null);

onMounted(() => {
  const params = readSignedParams();
  if (params) {
    signedParams.value = params;
    purchaseDate.value = params.rpd ?? params.lpd ?? "";
    purchaseYear.value = (params.rpd ?? params.lpd)?.slice(0, 4) ?? "";
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
  lifetime30: "Buy Lifetime License",
  freeLifetime: "Claim Lifetime License",
  free2year: "Claim Standard License",
  renew2year: "Renew Standard License",
};
const dialogTitle = computed(() => CLAIM_TITLES[pendingClaim.value ?? ""] ?? "Buy PopClip License");

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

function lifetimePricing(percentOff: number): PriceFields {
  const p = store.paddleProducts.value.popclip_lifetime;
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

// Full-price 2-year renewal pricing (no discount).
function twoYearPricing(): PriceFields {
  const p = store.paddleProducts.value.popclip_2year;
  if (!p) return { priceLabel: "" };
  return { priceLabel: roundPrice(p.displayPrice), priceIsDiscount: false, taxNote: p.taxNote ?? undefined };
}

// License expiry (for the license-holder copy): the date, whether it has passed,
// and a human-readable form.
const today = new Date().toISOString().slice(0, 10);
const licenseExpiry = computed(() => signedParams.value?.lxd ?? "");
const licenseExpired = computed(() => licenseExpiry.value !== "" && licenseExpiry.value < today);
const formattedExpiry = computed(() => (licenseExpiry.value ? formatDate(licenseExpiry.value) : ""));

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
}

// The secondary slot is either a full product card (e.g. the renewal) or a terse
// "alt" box (e.g. "support the app" / "free 2-year").
type SecondaryData =
  | { kind: "card"; label: string; card: CardData }
  | { kind: "alt"; title: string; html: string; cta: { label: string; theme: "brand" | "alt"; claim: string } };

interface SegmentData {
  headline: string;
  intro: string; // may contain inline HTML (rendered with v-html)
  primary: CardData;
  secondary?: SecondaryData;
  faq: { heading: string; body: string };
  fineprint: string;
}

const FINEPRINT_TAIL = `One upgrade per customer. Questions?&nbsp;<a href="/support">Contact support</a>.`;

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
    fineprint: `Offer for your Mac App Store purchase dated ${purchaseDate.value}. ${FINEPRINT_TAIL}`,
  };
}

// The 30%-off Lifetime card for the Mac App Store offer.
function masLifetimePrimary(): CardData {
  return lifetimeCard(30, {
    badge: "Your offer — 30% off",
    ctaLabel: "Buy Lifetime License — 30% off",
    footnote: "One-time purchase.",
    claim: "lifetime30",
  });
}

// The "free 2-year instead" fallback offered alongside the 30% deal.
function freeTwoYearAlt(): SecondaryData {
  return {
    kind: "alt",
    title: "Not able to pay right now?",
    html: `I don't want cost or payment issues to lock you out. Claim a <strong>free 2-year license</strong> instead, for 2 more years of updates. You can still claim a Lifetime discount later.`,
    cta: { label: "Claim a free 2-year license", theme: "alt", claim: "free2year" },
  };
}

// MAS receipt bought before 2023: Lifetime at 30% off. The free 2-year fallback is only
// offered to customers already gated out of the app (bought before the receipt cutoff);
// more recent buyers who aren't gated yet get just the upgrade offer, like an expiring license.
function masDiscountSegment(freeTwoYear: boolean): SegmentData {
  const seg: SegmentData = {
    headline: "Mac App Store Upgrade Offer",
    intro: `Thanks for being a PopClip user since <strong>${purchaseYear.value}</strong>. To move from your Mac App Store purchase to a Standalone edition license key, here is your upgrade offer:`,
    primary: masLifetimePrimary(),
    faq: {
      heading: "Why do I need a license key?",
      body: `Until now, PopClip has detected your Mac App Store purchase in the Standalone edition as a temporary measure to ease the move away from the store. But PopClip is now moving to requiring license keys for all users. After many years of free updates, and with a major new update now arriving, I am asking Mac App Store customers to buy their license key, discounted in recognition of your original purchase. The requirement is being introduced in stages, beginning (in PopClip 2026.7) with customers who bought PopClip in ${GATED_BEFORE_YEAR} or earlier. Your purchase supports the ongoing development of the app.`,
    },
    fineprint: `Offer for your Mac App Store purchase dated ${purchaseDate.value}. ${FINEPRINT_TAIL}`,
  };
  if (freeTwoYear) seg.secondary = freeTwoYearAlt();
  return seg;
}

// Generic support-granted discount: the same deal as the upgrade offer (30%
// off Lifetime, or a free 2-year), with no receipt or license dates — links
// are minted ad hoc, e.g. by support. Wording is deliberately generic.
function supportSegment(): SegmentData {
  return {
    headline: "PopClip Support Discount",
    intro: `Thanks for your interest in PopClip. Here is your discount offer:`,
    primary: masLifetimePrimary(),
    secondary: {
      kind: "alt",
      title: "Not able to pay right now?",
      html: `I don't want cost or payment issues to lock you out. Claim a <strong>free 2-year license</strong> instead, for 2 years of updates.`,
      cta: { label: "Claim a free 2-year license", theme: "alt", claim: "free2year" },
    },
    faq: {
      heading: "About this offer",
      body: "This discount link was provided to you by PopClip support. It can be used once, for a license for your own use.",
    },
    fineprint: FINEPRINT_TAIL,
  };
}

// Full-price 2-year renewal, offered as the secondary to an expired-license holder. It's a
// plain full-price purchase (no coupon), so it opens the checkout directly rather than going
// through getOfferCoupon — see renewStandard().
function renewalSecondary(): SecondaryData {
  return {
    kind: "card",
    label: "or renew your Standard license",
    card: {
      title: "Standard License",
      bullets: ["2 more years of free updates", "Keep the last version you receive"],
      ...twoYearPricing(),
      ctaLabel: "Renew for 2 years",
      ctaTheme: "alt",
      ctaSize: "medium",
      footnote: "One-time purchase.",
      claim: "renew2year",
    },
  };
}

// The Lifetime offer card for license holders — 30% off, same as the MAS deal.
function licenseLifetimePrimary(): CardData {
  return lifetimeCard(30, {
    badge: "Your offer — 30% off Lifetime",
    ctaLabel: "Upgrade to Lifetime",
    footnote: "One-time purchase.",
    claim: "lifetime30",
  });
}

// The few bits that distinguish the pure-license offer from the receipt+license offer.
// Everything else in the two license-style segments is identical.
interface LicenseVariant {
  introPrefix: string; // optional thanks-for-being-a-customer opening line
  fineprint: string;
}

// Plain license holder: framed purely as a Standalone license.
function pureLicenseVariant(): LicenseVariant {
  return {
    introPrefix: `Thanks for being a PopClip user since <strong>${purchaseYear.value}</strong>. `,
    fineprint: `Offer for your Standalone license dated ${purchaseDate.value}. ${FINEPRINT_TAIL}`,
  };
}

// License holder who is also an original (pre-2023) Mac App Store customer: same offer,
// with the Mac App Store receipt acknowledged in the fine print.
function receiptLicenseVariant(): LicenseVariant {
  return {
    introPrefix: `Thanks for being a PopClip user since <strong>${purchaseYear.value}</strong>. `,
    fineprint: `Offer for your Mac App Store purchase dated ${purchaseDate.value}. ${FINEPRINT_TAIL}`,
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
    intro: `${v.introPrefix}Your PopClip Standalone license expired on <strong>${formattedExpiry.value}</strong>. Upgrade or renew your license to keep getting updates.`,
    primary: licenseLifetimePrimary(),
    secondary: renewalSecondary(),
    faq: {
      heading: "Why do I need a new license?",
      body: `Your current license has expired, so it no longer receives new updates. You'll need a new license to use the latest version and future updates. Alternatively, you can keep using the previous version indefinitely with your currrent license. You can download the previous version from the downloads page.`,
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

// Rules are evaluated in order; the first whose `matches` returns true wins. All paid
// upgrades are 30% off Lifetime; the rules differ in presentation and extras (free claims,
// fallbacks). A pre-2023 receipt held alongside a license key is presented as a license
// upgrade with the receipt acknowledged. The license-only offer applies when there's no
// receipt, split by whether the key has expired.
const offerRules: OfferRule[] = [
  {
    // the generic support-granted discount has its own wording, regardless of dates
    name: "support",
    matches: (ctx) => ctx.offer === "support",
    build: () => supportSegment(),
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
      const v = receiptLicenseVariant();
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
      const v = pureLicenseVariant();
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
      {{ store.isLoadedForCoupon !== null ? `Showing prices for ${getFlagEmoji(store.countryCode.value)} ${store.countryName.value}` : `Loading prices...` }}
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
      <p :class="$style.faqText">{{ segment.faq.body }}</p>
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

.fineprint {
  text-align: center;
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 24px;
}
</style>

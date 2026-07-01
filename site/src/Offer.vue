<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { z } from "zod";
import config from "./config/config.json";
import { loadStore, useStoreState, formatCurrency, roundPrice } from "./composables/useStoreState";
import { useDeploymentInfo } from "./composables/useDeploymentInfo";
import { useLogger } from "./composables/useLogger";
import { usePaddleCheckout } from "./composables/usePaddleCheckout";
import { formatDate } from "./helpers/formatters";
import OfferCard from "./OfferCard.vue";

const log = useLogger();
const store = useStoreState();
const sandbox = useDeploymentInfo().isLocalhost;
const { openCheckout } = usePaddleCheckout();

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

// Read the signed offer params from either the URL fragment (preferred) or the
// query string, so PopClip can use whichever is convenient. The dates are
// optional, but at least one must be present for the upgrade page to make sense.
function readSignedParams(): SignedParams | null {
  const hash = (window.location.hash || "").replace(/^#/, "");
  const p = new URLSearchParams(window.location.search);
  for (const [k, v] of new URLSearchParams(hash)) p.set(k, v);
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
  const ok = params.id.length > 0 && params.sig.length > 0 && params.offer.length > 0 && dates.some((d) => d) && dates.every((d) => !d || DATE_RE.test(d));
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
  } else {
    status.value = "invalid";
  }
});

// The price fields shown on a card, mirroring the Buy page: a struck-through original
// price (when discounted), the actual price (or "Free"), and a "+ tax" flag. The offer
// discount is applied at the Paddle checkout, so the discounted price is computed here
// from the regular net price (the exact total still shows in the Paddle overlay).
type PriceFields = Pick<CardData, "listPrice" | "priceLabel" | "priceIsDiscount" | "taxed" | "discountNote">;

function lifetimePricing(percentOff: number): PriceFields {
  const p = store.paddleProducts.value.popclip_lifetime;
  if (!p) return { priceLabel: "" };
  if (percentOff >= 100) {
    return { listPrice: roundPrice(p.displayPrice), priceLabel: "Free", priceIsDiscount: true };
  }
  const net = p.priceNet * (1 - percentOff / 100);
  return {
    listPrice: percentOff > 0 ? roundPrice(p.displayPrice) : undefined,
    priceLabel: roundPrice(formatCurrency(net, p.currency)),
    priceIsDiscount: false,
    taxed: p.isTaxed,
    discountNote: percentOff > 0 ? `${percentOff}% off` : undefined,
  };
}

// Full-price 2-year renewal pricing (no discount).
function twoYearPricing(): PriceFields {
  const p = store.paddleProducts.value.popclip_2year;
  if (!p) return { priceLabel: "" };
  return { priceLabel: roundPrice(p.displayPrice), priceIsDiscount: false, taxed: p.isTaxed };
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
  taxed?: boolean; // show "+ tax" after the price (mirrors the Buy page)
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
// wording/footnote/claim differ between the free, 50%-off, and license-holder offers.
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
      html: `Your Lifetime License is free to claim. But if you'd like to support PopClip's continued development, you can choose to pay for it at 50% off instead. Thank you! (<a href="/terms">terms</a>)`,
      cta: { label: "Buy Lifetime at 50% off", theme: "alt", claim: "lifetime50" },
    },
    faq: {
      heading: "Why do I need a license key?",
      body: "PopClip is moving from Mac App Store purchase detection to requiring license keys for all users. Because you bought PopClip from the Mac App Store in 2023 or later, your purchase qualifies for a free upgrade to a Lifetime License.",
    },
    fineprint: `Offer for your Mac App Store purchase dated ${purchaseDate.value}. ${FINEPRINT_TAIL}`,
  };
}

// The 50%-off Lifetime card, shared by the Mac App Store and receipt+license cases.
function lifetime50Primary(): CardData {
  return lifetimeCard(50, {
    badge: "Your offer — 50% off",
    ctaLabel: "Buy Lifetime License — 50% off",
    footnote: "One-time purchase.",
    claim: "lifetime50",
  });
}

// The "free 2-year instead" fallback offered alongside the 50% deal.
function freeTwoYearAlt(): SecondaryData {
  return {
    kind: "alt",
    title: "Not able to pay right now?",
    html: `I don't want cost or payment issues to lock you out. Claim a <strong>free 2-year license</strong> instead, for 2 more years of updates. You can still claim a Lifetime discount later.`,
    cta: { label: "Claim a free 2-year license", theme: "alt", claim: "free2year" },
  };
}

// MAS receipt bought before 2023: Lifetime at 50% off. The free 2-year fallback is only
// offered to customers already gated out of the app (bought before the receipt cutoff);
// more recent buyers who aren't gated yet get just the upgrade offer, like an expiring license.
function masDiscountSegment(freeTwoYear: boolean): SegmentData {
  const seg: SegmentData = {
    headline: "Mac App Store Upgrade Offer",
    intro: `Thanks for being a PopClip user since <strong>${purchaseYear.value}</strong>. To move from your Mac App Store purchase to a Standalone edition license key, here is your upgrade offer:`,
    primary: lifetime50Primary(),
    faq: {
      heading: "Why do I need a license key?",
      body: `Until now, PopClip has detected your Mac App Store purchase in the Standalone edition as a temporary measure to ease the move away from the store. But PopClip is now moving to requiring license keys for all users. After many years of free updates, and with a major new update now arriving, I am asking Mac App Store customers to buy their license key, discounted in recognition of your original purchase. The requirement is being introduced in stages, beginning (in PopClip 2026.7) with customers who bought PopClip in ${GATED_BEFORE_YEAR} or earlier. Your purchase supports the ongoing development of the app.`,
    },
    fineprint: `Offer for your Mac App Store purchase dated ${purchaseDate.value}. ${FINEPRINT_TAIL}`,
  };
  if (freeTwoYear) seg.secondary = freeTwoYearAlt();
  return seg;
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

// The Lifetime offer card for license holders. Differs only by discount: 30% for a plain
// license holder, 50% when they also have a pre-2023 Mac App Store receipt.
function licenseLifetimePrimary(percent: 30 | 50): CardData {
  return lifetimeCard(percent, {
    badge: `Your offer — ${percent}% off Lifetime`,
    ctaLabel: "Upgrade to Lifetime",
    footnote: "One-time purchase.",
    claim: percent === 50 ? "lifetime50" : "lifetime30",
  });
}

// The few bits that distinguish the pure-license offer from the receipt+license offer.
// Everything else in the two license-style segments is identical.
interface LicenseVariant {
  percent: 30 | 50;
  introPrefix: string; // optional thanks-for-being-a-customer opening line
  fineprint: string;
}

// Plain license holder: 30% off, no thanks line, framed purely as a Standalone license.
function pureLicenseVariant(): LicenseVariant {
  return {
    percent: 30,
    introPrefix: `Thanks for being a PopClip user since <strong>${purchaseYear.value}</strong>. `,
    fineprint: `Offer for your Standalone license dated ${purchaseDate.value}. ${FINEPRINT_TAIL}`,
  };
}

// License holder who is also an original (pre-2023) Mac App Store customer: same offer at
// 50%, with a thanks line and the Mac App Store receipt acknowledged.
function receiptLicenseVariant(): LicenseVariant {
  return {
    percent: 50,
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
    primary: licenseLifetimePrimary(v.percent),
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
    primary: licenseLifetimePrimary(v.percent),
    secondary: renewalSecondary(),
    faq: {
      heading: "Why do I need a new license?",
      body: `Your current license has expired, so it no longer receives new updates. You'll need a new license to use the latest version and future updates. Alternatively, you can keep using the previous version indefinitely with your currrent license. You can download the previous version from the downloads page.`,
    },
    fineprint: v.fineprint,
  };
}

// Receipt takes precedence: every MAS offer (free / 50% off) beats the license 30%,
// so a customer with a receipt gets the MAS deal. A pre-2023 receipt held alongside a
// license key keeps that 50% deal but is presented as a license upgrade. The
// license-only offer applies when there's no receipt, split by whether the key has expired.
const segment = computed<SegmentData>(() => {
  const sp = signedParams.value;
  const rpd = sp?.rpd;
  const expired = licenseExpired.value;
  if (rpd) {
    if (rpd >= "2023-01-01") return masFreeSegment();
    // pre-2023 receipt + license key: the license offer, but at 50% and acknowledging the receipt
    if (sp?.lxd) {
      const v = receiptLicenseVariant();
      return expired ? expiredLicenseSegment(v) : expiringLicenseSegment(v);
    }
    // free 2-year only for pre-cutoff customers (those already gated out of the app)
    return masDiscountSegment(rpd < GATED_BEFORE);
  }
  // license only: same offer at 30%
  const v = pureLicenseVariant();
  return expired ? expiredLicenseSegment(v) : expiringLicenseSegment(v);
});

const ZCouponResponse = z.object({ coupon: z.string(), productId: z.string() });

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

// Route a card's CTA: the full-price renewal opens the checkout directly; every other claim
// is a discount, so it goes through getOfferCoupon to mint a coupon first.
function onBuy(claim: string) {
  if (claim === "renew2year") renewStandard();
  else startClaim(claim);
}

// Ask the Twix backend for a coupon for this claim within the signed offer (it
// verifies the signature and validates the claim), then open the Paddle checkout.
async function startClaim(claim: string) {
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
    if (!res.ok) throw new Error(`coupon request failed: ${res.status}`);
    const { coupon, productId } = ZCouponResponse.parse(await res.json());
    // pass the signed offer details through to the Paddle webhook
    await openCheckout({ product: productId, coupon, passthrough: offerPassthrough(claim) });
  } catch (e) {
    log("Failed to get upgrade coupon", e);
    couponError.value = true;
  } finally {
    busyOffer.value = null;
  }
}

// The 2-year renewal is a plain full-price purchase (no coupon), so it skips getOfferCoupon and
// opens the Paddle checkout directly for the Standard product (id from the loaded store).
async function renewStandard() {
  if (!signedParams.value || busyOffer.value) return;
  couponError.value = false;
  busyOffer.value = "renew2year";
  try {
    const productId = store.paddleProducts.value.popclip_2year?.productId;
    if (!productId) throw new Error("popclip_2year product not loaded yet");
    await openCheckout({ product: productId, passthrough: offerPassthrough("renew2year") });
  } catch (e) {
    log("Failed to start renewal checkout", e);
    couponError.value = true;
  } finally {
    busyOffer.value = null;
  }
}
</script>

<template>
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

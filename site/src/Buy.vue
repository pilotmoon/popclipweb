<script setup type="ts">
import { onMounted, onUnmounted, computed, ref } from "vue";
import { useSessionStorage } from "@vueuse/core";
import { getFlagEmoji } from "./helpers/getFlagEmoji";
import { loadStore, useStoreState, roundPrice, effectiveCoupon, storeLoadKey } from "./composables/useStoreState";
import { SALE, activeSaleCoupon, saleLastDayLabel } from "./data/sale";
import { usePaddleCheckout } from "./composables/usePaddleCheckout";
import { usePaddleBillingCheckout, isBillingActive } from "./composables/usePaddleBillingCheckout";
import { useOutstandingPurchase } from "./composables/useOutstandingPurchase";
import OutstandingPurchase from "./OutstandingPurchase.vue";
import PreCheckoutDialog from "./PreCheckoutDialog.vue";
import { Paypal, ApplePay, CreditCard, Ideal, Alipay, Weixin, QuestionCircleRegular, Check } from "@vicons/fa";
import { Icon } from "@vicons/utils";
import config from "./config/config.json";
import { readParams } from "./helpers/readParams";
import { isRegionallyPriced } from "./data/regionalPricing";
import { getRegionGlobe } from "./helpers/countries/getRegionGlobe";

const store = useStoreState();

// The running sale's code (null outside the sale window), applied by default
// to prices and checkout unless the URL names another coupon. Settled on
// mount: there is no clock or hostname worth trusting during the build's
// server render.
const saleCoupon = ref(null);
// What to say under a discounted price: the sale's name for the sale code,
// otherwise the code itself.
function couponLabel(code) {
  return code === SALE.coupon ? SALE.label : `Coupon "${code}" applied`;
}


// Short purple note shown under a product's price (once prices have loaded).
// Hidden while a sale is running, so it doesn't compete with the sale label.
const PRICE_MESSAGES = {
  popclip_lifetime: "★ Great Deal ★",
};

const isLizhi = computed(() =>
     config.lizhi.countries.includes(store.countryCode.value),
);
const regionallyPriced = computed(() => isRegionallyPriced(store.countryCode.value));
// Show the globe whose face matches the region we are quoting prices for.
const regionGlobe = computed(() => getRegionGlobe(store.countryCode.value));
// The load key (coupon|country) this page wants prices for: the sale code
// during a sale, or a #coupon= / #country= from the URL. Set on mount and on
// hash changes.
const wantedKey = ref(null);
// The prices to show: the stored ones, but only if they were priced for the
// key we want. Remembered prices from another page or an earlier visit
// would otherwise show full price for a moment before the sale prices
// arrive; better to say "Loading prices..." until the right ones are here.
// (A repeat visit during the sale still shows its remembered sale prices at
// once.)
const products = computed(() =>
  wantedKey.value !== null && store.paddleProductsKey.value === wantedKey.value ? store.paddleProducts.value : {},
);
const isLoading = computed(
  () => wantedKey.value === null || (store.isLoadedForCoupon.value !== wantedKey.value && !store.loadFailed.value),
);
const hasPrices = computed(() => Object.keys(products.value).length > 0);
// We couldn't get a price. That is the whole of what we know and the whole of
// what the page says: the buy buttons stay live, and if Paddle won't sell to
// this visitor it can say so itself at the checkout.
const noPrice = computed(() => store.loadFailed.value && !hasPrices.value);
// What to open the checkout with. Normally the loaded product; failing that,
// the price id the backend hands back when it can't price for this location.
function buyTarget(key) {
  const product = store.paddleProducts.value[key];
  if (product) return product;
  const priceId = store.checkoutPriceIds.value[key];
  return priceId ? { product: key, priceId } : undefined;
}
// The "Pay by ..." line: the methods Paddle offers here, as far as we can
// name them honestly. Local methods (the ones Paddle itself lists first)
// lead, then card, PayPal and Apple Pay. The Korean wallets are left out to
// keep the line short; the checkout still offers them.
//
// Google Pay is left out too, though Paddle offers it in Chrome: there's no
// telling Chrome apart from de-Googled Chromium browsers such as Helium,
// which claim the "Google Chrome" brand and answer yes to a Google Pay
// PaymentRequest query, yet Paddle's checkout doesn't show it there
// (checked Nov 2026). Better to under-claim than name a method that
// isn't offered.
const PAYMENT_METHOD_NAMES = {
  upi: "UPI",
  pix: "Pix",
  blik: "BLIK",
  mb_way: "MB WAY",
  ideal: "iDEAL",
  bancontact: "Bancontact",
  wechat_pay: "WeChat Pay",
  alipay: "Alipay",
  card: "card",
  paypal: "PayPal",
  apple_pay: "Apple Pay",
};
// Icons where Font Awesome has one; the rest are named in text only.
// (Weixin is WeChat's own logo, standing in for WeChat Pay.)
const PAYMENT_METHOD_ICONS = {
  ideal: Ideal,
  wechat_pay: Weixin,
  alipay: Alipay,
  card: CreditCard,
  paypal: Paypal,
  apple_pay: ApplePay,
};
const GLOBAL_METHODS = ["card", "paypal", "apple_pay"];
// Paddle lists apple_pay whatever the browser, so only claim it where the
// browser can actually use it. Checked on mount: there is no `window`
// during the build's server render.
const canApplePay = ref(false);
const paymentMethods = computed(() => {
  const listed = store.paymentMethods.value.filter(
    (m) => m in PAYMENT_METHOD_NAMES && (m !== "apple_pay" || canApplePay.value),
  );
  const local = listed.filter((m) => !GLOBAL_METHODS.includes(m));
  const global = GLOBAL_METHODS.filter((m) => listed.includes(m));
  return [...local, ...global];
});
const payWithText = computed(() => {
  const names = paymentMethods.value.map((m) => PAYMENT_METHOD_NAMES[m]);
  if (names.length === 0) return "";
  const last = names.pop();
  return `Pay by ${names.length ? `${names.join(", ")} or ` : ""}${last}`;
});
const payWithIcons = computed(() => paymentMethods.value.filter((m) => m in PAYMENT_METHOD_ICONS));

const { openCheckout } = usePaddleCheckout();
const { openCheckout: openBillingCheckout, initForTransactionCheckout } = usePaddleBillingCheckout();
const { interceptPurchase } = useOutstandingPurchase();

function queryBool(val) {
  return val === "" || val === "1";
}

onMounted(() => {
  try {
    canApplePay.value = Boolean(window.ApplePaySession?.canMakePayments());
  } catch {
    // throws on an insecure origin; no Apple Pay there anyway
  }
  saleCoupon.value = activeSaleCoupon();
  wantedKey.value = storeLoadKey(saleCoupon.value);
  loadStore(saleCoupon.value);
  // Re-fetch prices when the URL fragment changes (e.g. #country=JP) so the
  // display reacts live without a reload; loadStore's guard no-ops when the
  // coupon+country key is unchanged.
  const reloadOnHashChange = () => {
    wantedKey.value = storeLoadKey(saleCoupon.value);
    loadStore(saleCoupon.value);
  };
  window.addEventListener("hashchange", reloadOnHashChange);
  onUnmounted(() => window.removeEventListener("hashchange", reloadOnHashChange));
  // #name= and #email= params (e.g. from the PopClip upgrade flow) seed
  // the dialog; after that it tracks whatever the user last confirmed
  const nameParam = readParams().get("name");
  if (nameParam) {
    storedName.value = nameParam;
  }
  const emailParam = readParams().get("email");
  if (emailParam) {
    storedEmail.value = emailParam;
  }
  if (queryBool(readParams().get("go"))) {
    openPaddleCheckout();
  }
  // Paddle transaction links (the default payment link setting points at
  // this page) carry a real query param, ?_ptxn=txn_...; initializing
  // Paddle.js is enough — it detects the param and opens the checkout.
  if (isBillingActive() && new URLSearchParams(window.location.search).has("_ptxn")) {
    initForTransactionCheckout();
  }
});

// Pre-checkout dialog for the billing checkout: collects email (and the
// license name, when enabled). Values are prefilled from the remembered
// (or #email=/#name= passed-in) values, so a repeat click is a single
// Enter to confirm. Session storage: remembered for this tab only, not
// across visits.
const storedName = useSessionStorage("popclip-license-name", "");
const storedEmail = useSessionStorage("popclip-license-email", "");
const showDialog = ref(false);
const pendingProduct = ref(null);
const initialName = computed(() => storedName.value || "");
const initialEmail = computed(() => storedEmail.value || "");

const productTitles = {
  popclip_2year: "Buy Standard License",
  popclip_lifetime: "Buy Lifetime License",
};
const dialogTitle = computed(
  () => productTitles[pendingProduct.value?.product] ?? "Buy PopClip License",
);

// `product` is the processed product from the store (or undefined for the
// ?go auto-open, which only works once the store has loaded)
async function openPaddleCheckout(product) {
  // before the dialog, not after it: see interceptPurchase
  if (interceptPurchase()) return;
  if (isBillingActive()) {
    if (!product?.priceId) {
      console.error("[buy] no priceId for billing checkout", product);
      return;
    }
    if (config.paddleBilling.preCheckout) {
      pendingProduct.value = product;
      showDialog.value = true;
    } else {
      // no pre-checkout step: Paddle collects the email; any values seeded
      // from #email=/#name= params still pass through
      await openBillingCheckoutFor(product, {
        email: storedEmail.value || null,
        name: storedName.value || null,
        ownerEmail: null,
      });
    }
  } else {
    const coupon = readParams().get("coupon") ?? null;
    const email = readParams().get("email") ?? null;
    await openCheckout({ product: product?.productId, coupon, email });
  }
}

async function openBillingCheckoutFor(product, { email, name, ownerEmail }) {
  const coupon = effectiveCoupon(saleCoupon.value) || null;
  await openBillingCheckout({
    priceId: product.priceId,
    discountCode: coupon,
    email: email || null,
    customData: {
      ...(name ? { license_name: name } : {}),
      ...(ownerEmail ? { license_email: ownerEmail } : {}),
    },
  });
}

async function detailsConfirmed({ email, name, ownerEmail }) {
  storedEmail.value = email;
  if (name) {
    storedName.value = name;
  }
  showDialog.value = false;
  const product = pendingProduct.value;
  pendingProduct.value = null;
  if (product) {
    await openBillingCheckoutFor(product, { email, name, ownerEmail });
  }
}

function detailsCancelled() {
  showDialog.value = false;
  pendingProduct.value = null;
}

function trackBuy(button) {
  // va.track("Buy", { button });
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
  <OutstandingPurchase />
  <div :class="$style.container">
    <!-- <div :class="$style.box">
            <span>Buy from the Mac App Store</span><br>
            <a :href="store.masUrl.value" target="_blank" @click="trackBuy('Mac App Store')">
                <img :class="$style.buybadge" src="/badge-mas.svg" alt="Download on the Mac App Store">
            </a><br>
            <span :class="$style.price">{{ roundPrice(store.masPrice.value) }}</span>
        </div> -->

    <div :class="[$style.box, $style.featured]">
      <div :class="$style.product"><img src="/icon128.png" /> PopClip for macOS</div>
      <span :class="$style.title">Lifetime License</span><br />
      <ul :class="$style.checklist">
        <li>
          <Icon :class="$style.check"><Check /></Icon><span><b>Pay once, use forever</b> — no subscription</span>
        </li>
        <li>
          <Icon :class="$style.check"><Check /></Icon><span><b>Lifetime</b> free updates</span>
        </li>
        <li>
          <Icon :class="$style.check"><Check /></Icon><span>Use on up to <b>5 Macs</b></span>
        </li>
        <li>
          <Icon :class="$style.check"><Check /></Icon><span>Free iCloud sync</span>
        </li>
        <li>
          <Icon :class="$style.check"><Check /></Icon><span>30-day no-questions-asked refund</span>
        </li>
      </ul>
      <span :class="$style.small"><a href="/terms">Full license terms</a><br /></span>
      <hr v-if="isLizhi" />
      <span v-if="isLizhi" :class="$style.subtitle">Buy from Paddle<br /></span>
      <AaButton
        :class="$style.buybutton"
        @click="
          trackBuy('Paddle');
          openPaddleCheckout(buyTarget('popclip_lifetime'));
        "
        theme="brand"
        size="big"
      >
        Buy Lifetime License</AaButton
      ><br />
      <div :class="$style.prices">
        <span v-if="products.popclip_lifetime?.isDiscounted" :class="$style.listPrice">{{
          roundPrice(products.popclip_lifetime.displayListPrice ?? "")
        }}</span>
        <span :class="$style.price">{{ roundPrice(products.popclip_lifetime?.displayPrice ?? "") }} </span>
        <span v-if="products.popclip_lifetime?.isTaxed && !isLizhi" :class="$style.tax">+ tax</span>
        <span v-else-if="products.popclip_lifetime?.taxNote && !isLizhi" :class="$style.tax">{{
          products.popclip_lifetime.taxNote
        }}</span>
      </div>
      <div v-if="PRICE_MESSAGES.popclip_lifetime && !saleCoupon && products.popclip_lifetime && !isLizhi" :class="$style.priceMessage">
        <span>{{ PRICE_MESSAGES.popclip_lifetime }}</span>
      </div>
      <div v-if="products.popclip_lifetime?.coupon" :class="$style.couponInfo">
        <span>{{ couponLabel(products.popclip_lifetime.coupon) }}</span>
      </div>
      <div v-if="products.popclip_lifetime?.coupon === SALE.coupon" :class="$style.saleEnds">Offer until {{ saleLastDayLabel() }}</div>

      <div v-if="isLizhi">
        <hr />
        <span :class="$style.subtitle">Buy from DIGITALYCHEE<br /></span>
        <a :href="store.lizhiUrl.value" target="_blank" @click="trackBuy('DIGITALYCHEE')">
          <img :class="$style.buybadge" src="/badge-lizhi.svg" alt="Buy from DIGITALYCHEE Store" /> </a
        ><br />
        <span :class="$style.price">{{ roundPrice(store.lizhiLifetimePrice.value) }}</span><br />
      </div>
    </div>
    <!-- Standard License: a quieter second option under the featured
         Lifetime card -->
    <div :class="[$style.box, $style.secondary]">
      <div :class="$style.secondaryTitle">Standard License</div>
      <div :class="$style.secondaryDesc">
        2 years of free updates, then keep the last version you receive. Same 5 Macs, iCloud sync and 30-day refund.
      </div>
      <div :class="$style.secondaryBuy">
        <span :class="$style.secondaryPrice">
          <span v-if="products.popclip_2year?.isDiscounted" :class="$style.listPrice">{{
            roundPrice(products.popclip_2year.displayListPrice ?? "")
          }}</span>
          {{ roundPrice(products.popclip_2year?.displayPrice ?? "") }}
          <span v-if="products.popclip_2year?.taxNote && !isLizhi" :class="$style.tax">{{
            products.popclip_2year.taxNote
          }}</span>
        </span>
        <AaButton
          @click="
            trackBuy('Paddle');
            openPaddleCheckout(buyTarget('popclip_2year'));
          "
          theme="alt"
          size="small"
        >
          Buy Standard License
        </AaButton>
      </div>
      <div v-if="isLizhi" :class="$style.secondaryDesc">
        Or buy from
        <a :href="store.lizhiUrl.value" target="_blank" @click="trackBuy('DIGITALYCHEE')">DIGITALYCHEE</a>
        for {{ roundPrice(store.lizhiStandardPrice.value) }}
      </div>
    </div>
  </div>
  <!-- payment methods, listed once rather than inside every button, and
       only the ones Paddle offers here (see paymentMethods) -->
  <!-- <div v-if="payWithText && !noPrice" :class="$style.payWith">
    {{ payWithText }}
    <Icon v-for="m in payWithIcons" :key="m" :size="m === 'apple_pay' ? 28 : 16"><component :is="PAYMENT_METHOD_ICONS[m]" /></Icon>
  </div> -->
  <div :class="isLoading || noPrice ? $style.infoLineLoading : $style.infoLine">
    <template v-if="isLoading">Loading prices...</template>
    <template v-else-if="noPrice">Could not load prices.</template>
    <template v-else>
      {{ `Showing prices for ${getFlagEmoji(store.countryCode.value)} ${store.countryName.value}` }}
      <span v-if="regionallyPriced" :class="$style.regionalNote">
        ·
        <span :class="$style.regionalText"
          ><Icon :class="$style.regionalIcon"><component :is="regionGlobe" /></Icon> Regional pricing applied
          <a
            :class="$style.regionalHelp"
            href="/regional-pricing"
            target="_blank"
            rel="noopener"
            aria-label="About regional pricing"
            title="About regional pricing"
            ><Icon :class="$style.regionalIcon"><QuestionCircleRegular /></Icon></a></span
      ></span>
    </template>
  </div>
</template>

<style module>
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  /* center the boxes */
  width: 100%;
}

.box {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  width: 49%;
  padding: 12px;
  margin: 8px 0;
  text-align: center;
  box-sizing: border-box;
}

.box div.product {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 8px;
  gap: 4px;
}

.box span.title {
  font-size: 16px;
  font-weight: 600;
}

.box img {
  display: inline-block;
  height: 24px;
}

.box span.subtitle {
  font-size: 14px;
}

/* What's included: a left-aligned list, centred as a block in the box.
   `.box ul` outranks VitePress's `.vp-doc ul` / `.vp-doc li + li`, which
   would otherwise add bullets, indent and spacing. */
.box ul.checklist {
  width: fit-content;
  list-style: none;
  text-align: left;
  padding: 0;
  margin: 6px auto 8px;
  font-size: 14px;
}

.box ul.checklist li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 3px 0;
}

/* top-aligned with the item's first line (24px line, 13px icon) */
.check {
  flex-shrink: 0;
  margin-top: 5px;
  font-size: 13px;
  color: var(--vp-c-green-2);
}

.box span.small {
  font-size: 12px;
}

.box .buybutton {
  margin: 8px 0 6px 0;
  min-width: 10em;
  text-decoration: none;
}

.payWith {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.box div.prices {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.box span.price {
  font-size: 16px;
  font-weight: 600;
}

.box span.listPrice {
  font-size: 14px;
  text-decoration: line-through;
}

.box span.tax {
  font-size: 14px;
}

.box div.priceMessage {
  font-size: 14px;
  color: var(--vp-c-purple-2);
}

.box div.couponInfo {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-green-1);
}

/* Same green as the sale label above it, but not bold. */
.box div.saleEnds {
  font-size: 14px;
  color: var(--vp-c-green-1);
}

.box span.priceLoading {
  font-size: 14px;
  color: var(--vp-c-text-2);
  display: inline-block;
}

.box img.buybadge {
  display: block;
  margin: 8px 0 0px 0;
  height: 40px;
}

.box a {
  display: inline-block;
}

.infoLine {
  text-align: center;
}

.regionalNote {
  font-size: 0.85em;
}

/* Muted green so the note reads as a status, not something to click. */
.regionalText {
  color: var(--vp-c-green-2);
}

/* The help link is just a question-mark glyph in secondary text color: there
   for anyone who wants the detail, quiet enough not to pull clicks off the buy
   buttons. The `.infoLine` prefix raises specificity above VitePress's
   `.vp-doc a`, which would otherwise color and underline it like body copy. */
.infoLine .regionalNote a.regionalHelp {
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.infoLine .regionalNote a.regionalHelp:hover {
  color: var(--vp-c-brand-1);
}

/* Sit the glyph on the text baseline (icons render as inline SVG). */
.regionalIcon {
  vertical-align: -0.125em;
}

.infoLineLoading {
  text-align: center;

  color: var(--vp-c-text-2);
}

/* The featured product: bigger, with the brand-coloured border used on the
   offer pages' main card (OfferCard). */
.box.featured {
  width: 100%;
  max-width: 32em;
  padding: 20px 20px 24px;
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 12px;
}

.box.featured span.title {
  display: inline-block;
  font-size: 22px;
  font-weight: 700;
  margin: 2px 0 4px;
}

.box.featured ul.checklist {
  font-size: 15px;
}

.box.featured span.price {
  font-size: 22px;
  font-weight: 700;
}

.box.featured span.listPrice {
  font-size: 17px;
  color: var(--vp-c-text-2);
}

/* Just under the 22px price, so the sale reads as part of the price. */
.box.featured div.couponInfo {
  font-size: 19px;
  font-weight: 700;
  margin-top: 2px;
}

/* The secondary product: a plain, compact card under the featured one, with
   a neutral border like the offer pages' secondary card. */
.box.secondary {
  width: 100%;
  max-width: 32em;
  padding: 14px 20px;
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
}

.secondaryTitle {
  font-size: 16px;
  font-weight: 700;
}

.box div.secondaryDesc {
  margin: 2px 0 10px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.box div.secondaryDesc:last-child {
  margin: 8px 0 0;
}

.secondaryBuy {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
}

.secondaryPrice {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
}

.secondaryPrice span.listPrice,
.secondaryPrice span.tax {
  font-size: 14px;
  font-weight: 400;
}

@media (max-width: 768px) {
  .box {
    width: 100%;
  }
}
</style>

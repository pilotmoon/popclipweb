<script setup type="ts">
import { onMounted, computed } from "vue";
import { getFlagEmoji } from "./helpers/getFlagEmoji";
import { loadStore, useStoreState, roundPrice } from "./composables/useStoreState";
import { usePaddleCheckout } from "./composables/usePaddleCheckout";
import { usePaddleBillingCheckout, isBillingActive } from "./composables/usePaddleBillingCheckout";
import { Paypal, ApplePay, CreditCard } from "@vicons/fa";
import { Icon } from "@vicons/utils";
import config from "./config/config.json";
import { readParams } from "./helpers/readParams";

const store = useStoreState();

const isLizhi = computed(() =>
     config.lizhi.countries.includes(store.countryCode.value),
);
const { openCheckout } = usePaddleCheckout();
const { openCheckout: openBillingCheckout } = usePaddleBillingCheckout();

function queryBool(val) {
  return val === "" || val === "1";
}

onMounted(() => {
  loadStore();
  if (queryBool(readParams().get("go"))) {
    openPaddleCheckout();
  }
});

// `product` is the processed product from the store (or undefined for the
// ?go auto-open, which only works once the store has loaded)
async function openPaddleCheckout(product) {
  const coupon = readParams().get("coupon") ?? null;
  const email = readParams().get("email") ?? null;
  if (isBillingActive()) {
    if (!product?.priceId) {
      console.error("[buy] no priceId for billing checkout", product);
      return;
    }
    await openBillingCheckout({ priceId: product.priceId, discountCode: coupon, email });
  } else {
    await openCheckout({ product: product?.productId, coupon, email });
  }
}

function trackBuy(button) {
  // va.track("Buy", { button });
}
</script>

<template>
  <div :class="$style.container">
    <!-- <div :class="$style.box">
            <span>Buy from the Mac App Store</span><br>
            <a :href="store.masUrl.value" target="_blank" @click="trackBuy('Mac App Store')">
                <img :class="$style.buybadge" src="/badge-mas.svg" alt="Download on the Mac App Store">
            </a><br>
            <span :class="$style.price">{{ roundPrice(store.masPrice.value) }}</span>
        </div> -->
    <div :class="$style.box">
      <div :class="$style.product"><img src="/icon128.png" /> PopClip for macOS</div>
      <span :class="$style.title">Standard License</span><br />
      <span :class="$style.subtitle">✅ 2 years of free updates<br /></span>
      <span :class="$style.subtitle">✅ Use on all your Macs<br /></span>
      <span :class="$style.subtitle">✅ Keep the last version you receive<br /></span>
      <!-- <div :class="$style.features">
        <span :class="$style.feature"><span :class="$style.featureIcon">💻</span> Use on 5 Macs</span>
        <span :class="$style.feature"><span :class="$style.featureIcon">☁️</span> Free iCloud sync</span>
      </div> -->
      <span :class="$style.small"><a href="/terms">Full license terms</a><br /></span>

      <hr v-if="isLizhi" />
      <span v-if="isLizhi" :class="$style.subtitle">Buy from Paddle<br /></span>
      <AaButton
        :class="$style.buybutton"
        @click="
          trackBuy('Paddle');
          openPaddleCheckout(store.paddleProducts.value.popclip_2year);
        "
        theme="brand"
        size="medium"
      >
        Buy with
        <Icon size="18"><CreditCard /></Icon>
        <Icon size="18"><Paypal /></Icon>
        <Icon size="32"><ApplePay /></Icon> </AaButton
      ><br />
      <div :class="$style.prices">
        <span v-if="store.paddleProducts.value.popclip_2year?.isDiscounted" :class="$style.listPrice">{{
          roundPrice(store.paddleProducts.value.popclip_2year.displayListPrice ?? "")
        }}</span>
        <span :class="$style.price">{{ roundPrice(store.paddleProducts.value.popclip_2year?.displayPrice ?? "") }}</span>
        <span v-if="store.paddleProducts.value.popclip_2year?.isTaxed && !isLizhi" :class="$style.tax">+ tax</span>
        <span v-else-if="store.paddleProducts.value.popclip_2year?.taxNote && !isLizhi" :class="$style.tax">{{
          store.paddleProducts.value.popclip_2year.taxNote
        }}</span>
      </div>
      <div v-if="store.paddleProducts.value.popclip_2year?.message && !isLizhi" :class="$style.priceMessage">
        <span>{{ store.paddleProducts.value.popclip_2year?.message }}</span>
      </div>
      <div v-if="store.paddleProducts.value.popclip_2year?.coupon" :class="$style.couponInfo">
        <span>{{ `Coupon "${store.paddleProducts.value.popclip_2year?.coupon ?? ""}" applied` }}</span>
      </div>
      <span :class="$style.subtitle">One-time purchase<br /></span>

      <div v-if="isLizhi">
        <hr />
        <span :class="$style.subtitle">Buy from DIGITALYCHEE<br /></span>
        <a :href="store.lizhiUrl.value" target="_blank" @click="trackBuy('DIGITALYCHEE')">
          <img :class="$style.buybadge" src="/badge-lizhi.svg" alt="Buy from DIGITALYCHEE Store" /> </a
        ><br />
        <span :class="$style.price">{{ roundPrice(store.lizhiStandardPrice.value) }}</span
        ><br />
        <span :class="$style.subtitle">One-time purchase<br /></span>
      </div>
    </div>

    <div :class="$style.box">
      <div :class="$style.product"><img src="/icon128.png" /> PopClip for macOS</div>
      <span :class="$style.title">Lifetime License</span><br />
      <span :class="$style.subtitle">✅ Lifetime free updates<br /></span>
      <span :class="$style.subtitle">✅ Use on all your Macs<br /></span>
      <!-- <span :class="$style.subtitle">✅ Never expires<br /></span> -->
      <!-- <div :class="$style.features">
        <span :class="$style.feature"><span :class="$style.featureIcon">💻</span> Use on 5 Macs</span>
        <span :class="$style.feature"><span :class="$style.featureIcon">☁️</span> Free iCloud sync</span>
      </div> -->
      <span :class="$style.small"><a href="/terms">Full license terms</a><br /></span>
      <hr v-if="isLizhi" />
      <span v-if="isLizhi" :class="$style.subtitle">Buy from Paddle<br /></span>
      <AaButton
        :class="$style.buybutton"
        @click="
          trackBuy('Paddle');
          openPaddleCheckout(store.paddleProducts.value.popclip_lifetime);
        "
        theme="brand"
        size="medium"
      >
        Buy with
        <Icon size="18"><CreditCard /></Icon>
        <Icon size="18"><Paypal /></Icon>
        <Icon size="32"><ApplePay /></Icon> </AaButton
      ><br />
      <div :class="$style.prices">
        <span v-if="store.paddleProducts.value.popclip_lifetime?.isDiscounted" :class="$style.listPrice">{{
          roundPrice(store.paddleProducts.value.popclip_lifetime.displayListPrice ?? "")
        }}</span>
        <span :class="$style.price">{{ roundPrice(store.paddleProducts.value.popclip_lifetime?.displayPrice ?? "") }} </span>
        <span v-if="store.paddleProducts.value.popclip_lifetime?.isTaxed && !isLizhi" :class="$style.tax">+ tax</span>
        <span v-else-if="store.paddleProducts.value.popclip_lifetime?.taxNote && !isLizhi" :class="$style.tax">{{
          store.paddleProducts.value.popclip_lifetime.taxNote
        }}</span>
      </div>
      <div v-if="store.paddleProducts.value.popclip_lifetime?.message && !isLizhi" :class="$style.priceMessage">
        <span>{{ store.paddleProducts.value.popclip_lifetime?.message }}</span>
      </div>
      <div v-if="store.paddleProducts.value.popclip_lifetime?.coupon" :class="$style.couponInfo">
        <span>{{ `Coupon "${store.paddleProducts.value.popclip_lifetime?.coupon ?? ""}" applied` }}</span>
      </div>
      <span :class="$style.subtitle">One-time purchase<br /></span>

      <div v-if="isLizhi">
        <hr />
        <span :class="$style.subtitle">Buy from DIGITALYCHEE<br /></span>
        <a :href="store.lizhiUrl.value" target="_blank" @click="trackBuy('DIGITALYCHEE')">
          <img :class="$style.buybadge" src="/badge-lizhi.svg" alt="Buy from DIGITALYCHEE Store" /> </a
        ><br />
        <span :class="$style.price">{{ roundPrice(store.lizhiLifetimePrice.value) }}</span
        ><br />
        <span :class="$style.subtitle">One-time purchase<br /></span>
      </div>
    </div>
  </div>
  <div :class="store.isLoadedForCoupon !== null ? $style.infoLine : $style.infoLineLoading">
    {{ store.isLoadedForCoupon !== null ? `Showing prices for ${getFlagEmoji(store.countryCode.value)} ${store.countryName.value}` : `Loading prices...` }}
  </div>
  <!-- <div v-if="isLizhi" class="danger custom-block">
    <p class="custom-block-title">Warning: Avoid 🇨🇳 Chinese Scam Sellers!</p>
    <p>
      Please note that the <b>only authorized company</b> to sell PopClip licenses in China is <b>DIGITALYCHEE (数码荔枝)</b>. Their official websites are: ✅
      <a href="https://lizhi.shop">lizhi.shop</a>, ✅ <a href="https://digitalychee.taobao.com">digitalychee.taobao.com</a>.
    </p>

    <p>
      ❌🙅 Any other seller offering a license key is unauthorized. The seller will claim that the license is genuine, but in fact they obtained a single
      license key and sold it to multiple individuals. This is in violation of the terms of sale. The seller keeps all your money and does not pay me. All such
      license keys discovered will be canceled. For more information, please see the
      <a href="/ipr-china">Intellectual Property Rights Statement</a>.
    </p>
  </div> -->
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

.features {
  display: flex;
  justify-content: center;
  gap: 14px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 4px 0 6px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 4px;
}

.featureIcon {
  font-size: 13px;
  filter: grayscale(1);
  opacity: 0.65;
}

.box span.small {
  font-size: 12px;
}

.box .buybutton {
  margin: 8px 0 6px 0;
  text-decoration: none;
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

.infoLineLoading {
  text-align: center;

  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .box {
    width: 100%;
  }
}
</style>

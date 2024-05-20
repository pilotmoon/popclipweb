<script setup type="ts">
import { onMounted, computed } from "vue";
import { loadScript } from "./helpers/loadScript";
import { getFlagEmoji } from "./helpers/getFlagEmoji";
import { useStoreState } from "./composables/useStoreState";
import { useDeploymentInfo } from "./composables/useDeploymentInfo";
import { useLogger } from "./composables/useLogger";
import { Paypal, ApplePay, CreditCard } from "@vicons/fa";
import { Icon } from "@vicons/utils";
import config from "./config/config.json";
import { readParams } from "./helpers/readParams";

const log = useLogger();
const store = useStoreState();
const isLizhi = computed(() =>
  config.lizhi.countries.includes(store.countryCode.value),
);
const sandbox = useDeploymentInfo().isLocalhost;

function queryBool(val) {
  return val === "" || val === "1";
}

onMounted(() => {
  if (queryBool(readParams().get("go"))) {
    openPaddleCheckout();
  }
});

async function initPaddle() {
  await loadScript(config.paddle.script);
  if (sandbox) {
    Paddle.Environment.set("sandbox");
  }
  Paddle.Setup({
    vendor: config.paddle.vendorId,
    eventCallback: (args) => {
      log("Paddle event", args);
    },
  });
}

async function openPaddleCheckout() {
  await initPaddle();
  const coupon = readParams().get("coupon") ?? null;
  const email = readParams().get("email") ?? null;
  log("Coupon", coupon);
  const product = sandbox
    ? config.paddle.sandboxProductId
    : config.paddle.productId;
  log("Opening Paddle checkout");
  setTimeout(() => {
    Paddle.Checkout.open({ product, coupon, email });
  }, 200);
}

function roundPrice(price) {
  return price.endsWith(".00") ? price.substring(0, price.length - 3) : price;
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
        <div :class="$style.box" :hidden="!isLizhi || !store.isLoaded">
            <span>Buy License Key from DIGITALYCHEE</span><br>
            <a :href="store.lizhiUrl.value" target="_blank" @click="trackBuy('DIGITALYCHEE')">
                <img :class="$style.buybadge" src="/badge-lizhi.svg" alt="Buy from DIGITALYCHEE Store">
            </a><br>
            <span :class="$style.price">{{ roundPrice(store.lizhiPrice.value) }}</span>
        </div>
        <div :class="$style.box">
            <span>Buy License Key<span v-if="isLizhi"> from Paddle</span> </span><br>
            <AaButton :class="$style.buybutton" @click="trackBuy('Paddle'); openPaddleCheckout()" theme="brand"
                size="medium">
                Buy with
                <Icon size=18><CreditCard /></Icon>
                <Icon size=18><Paypal /></Icon>
                <Icon size=32><ApplePay /></Icon>
            </AaButton><br>
            <div :class="$style.prices">
                <span v-if="store.paddleProducts.value.popclip.isDiscounted" :class="$style.listPrice">{{ roundPrice(store.paddleProducts.value.popclip.displayListPrice) }}</span>
                <span :class="$style.price">{{ roundPrice(store.paddleProducts.value.popclip.displayPrice) }}</span>
            </div>
            <div v-if="store.paddleProducts.value.popclip.coupon" :class="$style.couponInfo">
                <span>{{ `Coupon "${store.paddleProducts.value.popclip.coupon}" applied`  }}</span>                
            </div>
        </div>
    </div>
    <div :class="store.isLoaded ? $style.infoLine : $style.infoLineLoading">
        {{ store.isLoaded ? `Showing prices for ${getFlagEmoji(store.countryCode.value)} ${store.countryName.value}` :
            `Loading prices...` }}
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

.box .buybutton {
    margin: 8px 0 6px 0;
    text-decoration: none;
}

.box div.prices{
    display: flex;
    justify-content: center;
    gap: 8px;
}

.box span.price {
    font-size: 14px;
    font-weight: 600;
}

.box span.listPrice {
    font-size: 14px;
    text-decoration: line-through;
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

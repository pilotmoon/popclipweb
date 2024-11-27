<script setup type="ts">
import { onMounted, computed } from "vue";
import { loadScript } from "./helpers/loadScript";
import { getFlagEmoji } from "./helpers/getFlagEmoji";
import { loadStore, useStoreState } from "./composables/useStoreState";
import { usePurchaseInfo } from "./composables/usePurchaseInfo";
import { useDeploymentInfo } from "./composables/useDeploymentInfo";
import { useLogger } from "./composables/useLogger";
import { Paypal, ApplePay, CreditCard } from "@vicons/fa";
import { Icon } from "@vicons/utils";
import config from "./config/config.json";
import { readParams } from "./helpers/readParams";
import { useData } from "vitepress";
import { z } from "zod";

const { isDark } = useData();
const log = useLogger();
const store = useStoreState();
const purchaseInfo = usePurchaseInfo();

const isLizhi = computed(() =>
  config.lizhi.countries.includes(store.countryCode.value),
);
const sandbox = useDeploymentInfo().isLocalhost;

function queryBool(val) {
  return val === "" || val === "1";
}

onMounted(() => {
  loadStore();
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
    eventCallback: async (args) => {
      log("Paddle event", args);
      if (args.event === "Checkout.Complete") {
        checkoutComplete(args);
      }
    },
  });
}

function checkoutComplete(args) {
  const eventData = z
    .object({
      checkout: z.object({
        passthrough: z.string().optional(),
      }),
      user: z.object({
        email: z.string(),
        country: z.string(),
      }),
    })
    .safeParse(args.eventData);

  if (!eventData.success) {
    log("Error parsing checkout data", eventData.error);
    return;
  }

  let passthrough_obj;
  try {
    passthrough_obj = JSON.parse(eventData.data.checkout.passthrough);
  } catch (e) {
    log("Error parsing passthrough data", e);
  }
  passthrough_obj = z
    .object({
      flow_id: z.string().min(24).optional(),
    })
    .safeParse(passthrough_obj);
  if (!passthrough_obj.success) {
    log("Error getting passthrough data", passthrough_obj.error);
    return;
  }

  if (!passthrough_obj.data.flow_id) {
    log("No flow_id in passthrough data");
    return;
  }

  // redirect
  purchaseInfo.flowId.value = passthrough_obj.data.flow_id;
  purchaseInfo.userEmail.value = eventData.data.user.email;
  purchaseInfo.userCountry.value = eventData.data.user.country;
  window.location.href = "/purchase-complete";
}

async function generateRandomKey() {
  if (window.crypto) {
    return window.crypto.randomUUID();
  }
}

async function openPaddleCheckout(product) {
  await initPaddle();
  const coupon = readParams().get("coupon") ?? null;
  const email = readParams().get("email") ?? null;
  log({ coupon, email });
  log("Opening Paddle checkout");
  setTimeout(async () => {
    Paddle.Checkout.open({
      product: sandbox ? config.paddle.sandboxProductId : product,
      coupon,
      email: sandbox ? "pcweb.testing@pilotmoon.com" : email,
      country: sandbox ? "GB" : null,
      postcode: sandbox ? "SW1 1AA" : null,
      allowQuantity: false,
      displayModeTheme: isDark.value ? "dark" : "light",
      passthrough: JSON.stringify({
        flow_id: await generateRandomKey(),
      }),
    });
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
        <div :class="$style.box">
            <div :class="$style.product"><img src="/icon128.png"> PopClip for macOS</div>
            <span :class="$style.title">Standard License</span><br>            
            <span :class="$style.subtitle">✅ 2 years of free updates<br></span>
            <span :class="$style.subtitle">✅ Keep the last version you receive<br></span>
            <span :class="$style.subtitle">✅ Use on all your Macs<br></span>
            <span :class="$style.small"><a href="/terms">Full license terms</a><br></span>
            <span v-if="isLizhi" :class="$style.subtitle">Buy from Paddle<br></span>
            <AaButton :class="$style.buybutton" @click="trackBuy('Paddle'); openPaddleCheckout(store.paddleProducts.value.popclip_2year?.productId)" theme="brand"
                size="medium">
                Buy with
                <Icon size=18><CreditCard /></Icon>
                <Icon size=18><Paypal /></Icon>
                <Icon size=32><ApplePay /></Icon>                
            </AaButton><br>
            <div :class="$style.prices">
                <span v-if="store.paddleProducts.value.popclip_2year?.isDiscounted" :class="$style.listPrice">{{ roundPrice(store.paddleProducts.value.popclip_2year.displayListPrice ?? "") }}</span>
                <span :class="$style.price">{{ roundPrice(store.paddleProducts.value.popclip_2year?.displayPrice ?? "") }}</span>
                <span v-if="store.paddleProducts.value.popclip_2year?.isTaxed" :class="$style.tax">+ tax</span>
            </div>
            <div v-if="store.paddleProducts.value.popclip_2year?.message" :class="$style.priceMessage">
                <span>{{ store.paddleProducts.value.popclip_2year?.message  }}</span>                
            </div>
            <div v-if="store.paddleProducts.value.popclip_2year?.coupon" :class="$style.couponInfo">
                <span>{{ `Coupon "${store.paddleProducts.value.popclip_2year?.coupon ?? ""}" applied`  }}</span>                
            </div>
            <span :class="$style.subtitle">One-time purchase<br></span>
        </div>
        <div :class="$style.box">
            <div :class="$style.product"><img src="/icon128.png"> PopClip for macOS</div>
            <span :class="$style.title">Lifetime License</span><br>            
            <span :class="$style.subtitle">✅ Lifetime free updates<br></span>
            <span :class="$style.subtitle">✅ Use on all your Macs<br></span>
            <span :class="$style.small"><a href="/terms">Full license terms</a><br></span>
            <span v-if="isLizhi" :class="$style.subtitle">Buy from Paddle<br></span>
            <AaButton :class="$style.buybutton" @click="trackBuy('Paddle'); openPaddleCheckout(store.paddleProducts.value.popclip_lifetime?.productId)" theme="brand"
                size="medium">
                Buy with
                <Icon size=18><CreditCard /></Icon>
                <Icon size=18><Paypal /></Icon>
                <Icon size=32><ApplePay /></Icon>
            </AaButton><br>
            <div :class="$style.prices">
                <span v-if="store.paddleProducts.value.popclip_lifetime?.isDiscounted" :class="$style.listPrice">{{ roundPrice(store.paddleProducts.value.popclip_lifetime.displayListPrice ?? "") }}</span>
                <span :class="$style.price">{{ roundPrice(store.paddleProducts.value.popclip_lifetime?.displayPrice ?? "") }}</span>
                <span v-if="store.paddleProducts.value.popclip_lifetime?.isTaxed" :class="$style.tax">+ tax</span>
            </div>
            <div v-if="store.paddleProducts.value.popclip_lifetime?.message && !isLizhi" :class="$style.priceMessage">
                <span>{{ store.paddleProducts.value.popclip_lifetime?.message  }}</span>                
            </div>
            <div v-if="store.paddleProducts.value.popclip_lifetime?.coupon" :class="$style.couponInfo">
                <span>{{ `Coupon "${store.paddleProducts.value.popclip_lifetime?.coupon ?? ""}" applied`  }}</span>                
            </div>
            <span :class="$style.subtitle">One-time purchase<br></span>
        </div>
        <div :class="$style.box" :hidden="!isLizhi || store.isLoadedForCoupon === null">
            <div :class="$style.product"><img src="/icon128.png"> PopClip for macOS</div>
            <span :class="$style.title">Lifetime License</span><br>            
            <span :class="$style.subtitle">✅ Lifetime free updates<br></span>
            <span :class="$style.subtitle">✅ Use on all your Macs<br></span>
            <span :class="$style.small"><a href="/terms">Full license terms</a><br></span>
            <span v-if="isLizhi" :class="$style.subtitle">Buy from DIGITALYCHEE<br></span>
            <a :href="store.lizhiUrl.value" target="_blank" @click="trackBuy('DIGITALYCHEE')">
                <img :class="$style.buybadge" src="/badge-lizhi.svg" alt="Buy from DIGITALYCHEE Store">
            </a><br>
            <span :class="$style.price">{{ roundPrice(store.lizhiPrice.value) }}</span><br>
            <span :class="$style.subtitle">One-time purchase<br></span>
        </div>
    </div>
    <div :class="store.isLoadedForCoupon !== null ? $style.infoLine : $style.infoLineLoading">
        {{ store.isLoadedForCoupon !== null ? `Showing prices for ${getFlagEmoji(store.countryCode.value)} ${store.countryName.value}` :
            `Loading prices...` }}
    </div>
    <div v-if="isLizhi" class="danger custom-block">
        <p class="custom-block-title">Warning: Avoid 🇨🇳 Chinese Scam Sellers!</p>
        <p>Please note that the <b>only authorized company</b> to sell PopClip licenses in China is <b>DIGITALYCHEE (数码荔枝)</b>. Their official websites are:
          ✅ <a href="https://lizhi.shop">lizhi.shop</a>,
          ✅ <a href="https://digitalychee.taobao.com">digitalychee.taobao.com</a>.
        </p>
          
          <p>❌🙅 Any other seller offering a license key is unauthorized.
            The seller will claim that the license is genuine, but in fact they obtained a single license key and sold it to multiple individuals.
            This is in violation of the terms of sale. 
            The seller keeps all your money and does not pay me.
            All such license keys discovered will be canceled.
            For more information, please see the <a href="/ipr-china">Intellectual Property Rights Statement</a>.
        </p>
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

.box span.small {
    font-size: 12px;    
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

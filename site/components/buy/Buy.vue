<script setup type="ts">
import { onMounted, reactive, computed } from 'vue'
import { loadScript } from '../loadScript.ts'
import { getCountryInfo } from './getCountryInfo.ts'
import { getMacAppStoreLink } from './getMacAppStoreLink.ts'
import Button from '../Button.vue'
import * as config from '../config.json'

const info = reactive({
    countryCode: "",
    countryName: "",
    appStoreCode: "",
    paddlePrice: "",
    lizhiPrice: config.lizhi.price,
    lizhiUrl: config.lizhi.storeUrl,
});

const isInfoLoaded = computed(() => !!info.countryCode);
const isLizhi = computed(() => config.lizhi.countries.includes(info.countryCode));
const masLink = computed(() => getMacAppStoreLink(
    config.apple.appId, config.apple.slug, info.appStoreCode
));

function openPaddleCheckout(event) {
    console.log("Opening Paddle checkout");
    Paddle.Checkout.open({ product: config.paddle.productId });
}

function roundPrice(price) {
    return price.endsWith('.00') ? price.substring(0, price.length - 3) : price;
};

onMounted(async () => {
    // only call paddle setup when script is first loaded, not on subsequent navigations
    if (await loadScript(config.paddle.script)) {
        Paddle.Setup({
            vendor: config.paddle.vendorId, eventCallback: function (args) {
                console.log("Paddle event", args);
            }
        });
    }

    Paddle.Product.Prices(config.paddle.productId, function (paddlePrices) {
        console.log("paddle prices", paddlePrices);
        const countryInfo = getCountryInfo(paddlePrices.country);
        console.log("info", info);
        info.countryCode = paddlePrices.country;
        info.paddlePrice = paddlePrices.price.gross;
        info.countryName = countryInfo.countryName;
        info.appStoreCode = countryInfo.appStoreCode;
    });
});
</script>

<template>
    <div :class="$style.container">
        <div :class="$style.box">
            <span>Buy from the Mac App Store</span><br>
            <a :href="masLink" target="_blank">
                <img :class="$style.buybadge" src="./masbadge.svg" alt="Download on the Mac App Store">
            </a><br>
            <span :class="$style.price"></span>
        </div>
        <div :class="$style.box" :hidden="!isLizhi || !isInfoLoaded">
            <span>Buy License Key from DIGITALYCHEE</span><br>
            <a :href="info.lizhiUrl" target="_blank">
                <img :class="$style.buybadge" src="./lizhibadge.svg" alt="Buy from DIGITALYCHEE Store">
            </a><br>
            <span :class="$style.price">{{ info.lizhiPrice }}</span>
        </div>
        <div :class="$style.box">
            <span>Buy License Key{{ isLizhi ? " from Paddle" : ""}}</span><br>
            <Button :class="$style.buybutton" text="Buy" href="#!" @click="openPaddleCheckout" theme="brand" /><br>
            <span :class="$style.price">{{ isInfoLoaded ? "" : "Loading price..." }}{{ roundPrice(info.paddlePrice)
            }}</span>
        </div>
    </div>
</template>

<style module>
.container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
}

.box {
    background-color: var(--vp-c-bg-soft);
    border-radius: 8px;
    width: 49%;
    padding: 16px;
    margin: 8px 0;
    text-align: center;
    box-sizing: border-box;
}

.box .buybutton {
    margin: 8px 0 6px 0;
    text-decoration: none;
}

.box span.price {
    font-size: 14px;
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


@media (max-width: 768px) {
    .box {
        width: 100%;
    }
}
</style>

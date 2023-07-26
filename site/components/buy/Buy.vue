<script setup type="ts">
import { onMounted, reactive, computed } from 'vue'
import { loadScript } from '../loadScript.ts'
import { getCountryInfo } from './getCountryInfo.ts'
import { getFlagEmoji } from './getFlagEmoji.ts'
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

async function openPaddleCheckout(event) {
    // only call paddle setup when script is first loaded, not on subsequent calls
    const sandbox = window.location.hostname === "localhost";
    if (await loadScript(config.paddle.script)) {
        if (sandbox) {
            Paddle.Environment.set('sandbox');
        }
        Paddle.Setup({
            vendor: config.paddle.vendorId, eventCallback: function (args) {
                console.log("Paddle event", args);
            }
        });
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    const product = sandbox ? config.paddle.sandboxProductId : config.paddle.productId;
    console.log("Opening Paddle checkout");
    Paddle.Checkout.open({ product });
}

function roundPrice(price) {
    return price.endsWith('.00') ? price.substring(0, price.length - 3) : price;
};

onMounted(async () => {
    const fetchResponse = await fetch("https://api.pilotmoon.com/webhooks/store/getPrices?product=" + config.pilotmoon.product);
    const { country, prices } = await fetchResponse.json();
    console.log("prices", prices);
    if (country) {
        const countryInfo = getCountryInfo(country);
        console.log("getCountryInfo", info);
        info.countryCode = country;
        info.countryName = countryInfo.countryName;
        info.appStoreCode = countryInfo.appStoreCode;
        info.paddlePrice = prices.paddle.formatted;
    }
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
            <span>Buy License Key from Paddle</span><br>
            <Button :class="$style.buybutton" text="Buy" @click="openPaddleCheckout" theme="brand" /><br>
            <span :class="$style.price">{{ isInfoLoaded ? "" : "Loading price..." }}{{ roundPrice(info.paddlePrice)
            }}</span>
        </div>
    </div>
    <div :class="$style.infoLine" v-if="info.countryName">
        Showing prices for {{ getFlagEmoji(info.countryCode) }} {{ info.countryName }}
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

.infoLine {
    text-align: center;
    margin-bottom: -24px;
}


@media (max-width: 768px) {
    .box {
        width: 100%;
    }
}
</style>

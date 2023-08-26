<script setup type="ts">
import { onMounted, computed } from 'vue'
import { loadScript } from './helpers/loadScript'
import { getFlagEmoji } from './helpers/getFlagEmoji'
import { store, loadStore, isLoaded } from './helpers/store/store'
import Button from './Button.vue'
import { ShoppingOutlined } from '@ant-design/icons-vue'
import * as config from './config/config.json'

const isLizhi = computed(() => config.lizhi.countries.includes(store.countryCode));

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

onMounted(() => {
    loadStore();
});

</script>

<template>
    <div :class="$style.container">
        <div :class="$style.box">
            <span>Buy from the Mac App Store</span><br>
            <a :href="store.masUrl" target="_blank">
                <img :class="$style.buybadge" src="./static/masbadge.svg" alt="Download on the Mac App Store">
            </a><br>
            <span :class="$style.price">{{ roundPrice(store.masPrice) }}</span>
        </div>
        <div :class="$style.box" :hidden="!isLizhi || !isLoaded">
            <span>Buy License Key from DIGITALYCHEE</span><br>
            <a :href="store.lizhiUrl" target="_blank">
                <img :class="$style.buybadge" src="./static/lizhibadge.svg" alt="Buy from DIGITALYCHEE Store">
            </a><br>
            <span :class="$style.price">{{ roundPrice(store.lizhiPrice) }}</span>
        </div>
        <div :class="$style.box">
            <span>Buy License Key from Paddle</span><br>
            <Button :class="$style.buybutton" @click="openPaddleCheckout" theme="brand" size="medium"><ShoppingOutlined /> Buy</Button><br>
            <span :class="$style.price">{{ roundPrice(store.paddlePrice) }}</span>
        </div>
    </div>
    <div :class="isLoaded ? $style.infoLine : $style.infoLineLoading">
        {{ isLoaded ? `Showing prices for ${getFlagEmoji(store.countryCode)} ${store.countryName}` :
            `Loading prices...` }}
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
    padding: 12px;
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
    font-weight: 600;
    display: inline-block;
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
    margin-bottom: -24px;
}

.infoLineLoading {
    text-align: center;
    margin-bottom: -24px;
    color: var(--vp-c-text-2);
}


@media (max-width: 768px) {
    .box {
        width: 100%;
    }
}
</style>

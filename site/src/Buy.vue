<script setup type="ts">
import va from '@vercel/analytics';
import { onMounted, computed } from 'vue'
import { loadScript } from './helpers/loadScript'
import { getFlagEmoji } from './helpers/getFlagEmoji'
import { useStoreState, loadStore } from './composables/useStoreState'
import { useLocalhost } from './composables/useLocalhost'
import { ShoppingOutlined } from '@ant-design/icons-vue'
import config from './config/config.json'

const store = useStoreState();
const isLizhi = computed(() => config.lizhi.countries.includes(store.countryCode.value));
const sandbox = useLocalhost();

async function initPaddle() {
    await loadScript(config.paddle.script);
    if (sandbox) {
        Paddle.Environment.set('sandbox');
    }
    Paddle.Setup({
        vendor: config.paddle.vendorId, eventCallback: function (args) {
            console.log("Paddle event", args);
        }
    });
}

async function openPaddleCheckout(event) {
    const product = sandbox ? config.paddle.sandboxProductId : config.paddle.productId;
    console.log("Opening Paddle checkout");
    Paddle.Checkout.open({ product });
}

function roundPrice(price) {
    return price.endsWith('.00') ? price.substring(0, price.length - 3) : price;
};

onMounted(async () => {
    await Promise.all([loadStore(), initPaddle()]);
});

function trackBuy(button) {
    const info = { button };
    console.log("Buy", JSON.stringify(info));
    va.track("Buy", info);
}
</script>

<template>
    <div :class="$style.container">
        <div :class="$style.box">
            <span>Buy from the Mac App Store</span><br>
            <a :href="store.masUrl.value" target="_blank" @click="trackBuy('Mac App Store')">
                <img :class="$style.buybadge" src="/badge-mas.svg" alt="Download on the Mac App Store">
            </a><br>
            <span :class="$style.price">{{ roundPrice(store.masPrice.value) }}</span>
        </div>
        <div :class="$style.box" :hidden="!isLizhi || !store.isLoaded">
            <span>Buy License Key from DIGITALYCHEE</span><br>
            <a :href="store.lizhiUrl.value" target="_blank" @click="trackBuy('DIGITALYCHEE')">
                <img :class="$style.buybadge" src="/badge-lizhi.svg" alt="Buy from DIGITALYCHEE Store">
            </a><br>
            <span :class="$style.price">{{ roundPrice(store.lizhiPrice.value) }}</span>
        </div>
        <div :class="$style.box">
            <span>Buy License Key<span v-if="isLizhi"> from Paddle</span></span><br>
            <AaButton :class="$style.buybutton" @click="trackBuy('Paddle'); openPaddleCheckout()" theme="brand" size="medium"><ShoppingOutlined /> Buy</AaButton><br>
            <span :class="$style.price">{{ roundPrice(store.paddlePrice.value) }}</span>
        </div>
    </div>
    <!-- <div :class="store.isLoaded ? $style.infoLine : $style.infoLineLoading">
        {{ store.isLoaded ? `Showing prices for ${getFlagEmoji(store.countryCode.value)} ${store.countryName.value}` :
            `Loading prices...` }}
    </div> -->
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

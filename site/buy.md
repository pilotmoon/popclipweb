# Buy PopClip

## One-time Purchase

PopClip is available to buy as one-time purchase, either from the Mac App Store or by buying a license key.

<div :class="$style.container">
    <div :class="$style.box">
			<span>Buy from the Mac App Store</span><br>
			<a :href="masLink" target="_blank">
				<img :class="$style.buybadge" src="/masbadge.svg" alt="Download on the Mac App Store" />
			</a>
		</div>
		<div :class="$style.box" :hidden="!isLizhi || !isInfoLoaded">
			<span>Buy License Key from DIGITALYCHEE</span><br>
			<a :href="info.lizhiUrl" target="_blank">
				<img :class="$style.buybadge" src="/lizhibadge.svg" alt="Buy from DIGITALYCHEE Store" />
			</a><br>
			<span :class="$style.price">{{ info.lizhiPrice }}</span>
		</div>
		<div :class="$style.box">
		<span>Buy License Key from Paddle</span><br>
			<a :class="$style.button" href="#!" @click="openPaddleCheckout">
				Buy
			</a><br>
			<span :class="$style.price">{{ isInfoLoaded ? "" : "Loading price..." }}{{ roundedPaddlePrice }}</span>
		</div>
</div>

## Subscribe

PopClip is also available as part of a
[Setapp subscription](https://go.setapp.com/stp304?refAppId=159&refVendorId=92).

<setapp-custom-banner iconUrl="/icon512.png" appName="PopClip" appId="159" vendorId="92"></setapp-custom-banner>

## Terms and Conditions

Your purchase is subject to the [Terms of License](/terms).

## Student Discount

Students can get a discount on a PopClip license key purchase{{ isLizhi ? " (from Paddle)" : ""}}, via
[Student App Centre](https://studentappcentre.com/app/popclip).

<!-- ## Purchase FAQs

**What are the differences between the Mac App Store edition, Standalone edition
and Setapp edition?** The editions are identical in features and abilities. The
only difference is the way you obtain the app and how you buy it. -->

<script setup>
	import { onMounted, reactive, computed } from 'vue'
	import { loadScript } from '/buy-src/loadScript.ts'
	import { getCountryInfo } from '/buy-src/getCountryInfo.ts'
	import { getMacAppStoreLink } from '/buy-src/getMacAppStoreLink.ts'
	import { getFlagEmoji } from '/buy-src/getFlagEmoji.ts'
	import * as config from '/buy-src/config.json'

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
	const roundedPaddlePrice = computed(() => {
		if (!info.countryCode) {
			return ""
		}
		const price = info.paddlePrice;
		return price.endsWith('.00') ? price.substring(0, price.length - 3) : price;
	});
	const paddleButtonText = computed(() => {
  	if (!roundedPaddlePrice.value) {
			return "Loading price..."
		}
		return `${getFlagEmoji(info.countryCode)} Buy for ${roundedPaddlePrice.value}`;
	});
	function openPaddleCheckout(event) {
			console.log("Opening Paddle checkout");
			Paddle.Checkout.open({ product: config.paddle.productId });
	}

	onMounted(async () => {
		loadScript("/external-js/setapp.js");

		// only call paddle setup when script is first loaded, not on subsequent navigations
		if (await loadScript("/external-js/paddle.js")) {
			Paddle.Setup({ vendor: config.paddle.vendorId, eventCallback: function(args) {
				console.log("Paddle event", args);
			}});
		}

		Paddle.Product.Prices(config.paddle.productId, function(paddlePrices) {
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
  width: 49%; /* slightly less than half to allow some room for margins */
  padding: 16px;
  margin: 8px 0;
	text-align: center;
  box-sizing: border-box;
}

.box a.button {
	text-decoration: none;
	margin: 8px 0 6px 0;
	background-color: var(--vp-button-brand-bg);
	color: var(--vp-button-brand-text);
	border-radius: 20px;
	padding: 0 20px;
	line-height: 38px;
	font-size: 14px;
	font-weight: 600;
	border: 1px solid var(--vp-button-brand-border);
	display: inline-block;
}

.box span.price {
	font-size: 14px;
	display: inline-block;
}

.box a.button:hover {
	background-color: var(--vp-button-brand-hover-bg);
	color: var(--vp-button-brand-hover-text);
	border: 1px solid var(--vp-button-brand-hover-border);
}

.box a.button:active {
	text-decoration: none;
	background-color: var(--vp-button-brand-active-bg);
	color: var(--vp-button-brand-active-text);
	border: 1px solid var(--vp-button-brand-active-border);
}

.box img.buybadge {
	display: inline-block;
	margin-top: 8px;
	height: 40px;
}

@media (max-width: 768px) {
  .box {
    width: 100%;
  }
}
</style>

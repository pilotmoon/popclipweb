# Purchase PopClip

## One-time Purchase

PopClip is available to buy as one-time purchase, either by buying a license
key, or via the Mac App Store.

<div class="container">
    <div class="box">
			<a :href="buyLink" :target="buyTarget" @click="buyClicked">
				Buy License Key ({{ priceDisplay }})
			</a>
		</div>
    <div class="box">
			<a :href="masLink" target="_blank">Buy from Mac App Store</a>
		</div>
</div>

## Subscribe

PopClip is also available as part of a
[Setapp subscription](https://go.setapp.com/stp304?refAppId=159&refVendorId=92).

<setapp-custom-banner iconUrl="/icon512.png" appName="PopClip" appId="159" vendorId="92"></setapp-custom-banner>

## Terms and Conditions

Your purchase is subject to the [Terms of License](/terms).

## Student Discount

Students can get a discount on PopClip via
[Student App Centre](https://studentappcentre.com/app/popclip).

## Purchase FAQs

**What are the differences between the Mac App Store edition, Standalone edition
and Setapp edition?** The editions are identical in features and abilities. The
only difference is the way you obtain the app and how you buy it.

<script setup>
	import { onMounted, ref, computed } from 'vue'
	import { loadScript } from '/buy-src/loadScript.ts'
	import { getCountryInfo } from '/buy-src/getCountryInfo.ts'
	import { getMacAppStoreLink } from '/buy-src/getMacAppStoreLink.ts'
	import * as config from '/buy-src/config.json'

	// vue refs
	const countryCode = ref("")
	const countryName = ref("")
	const appStoreCode = ref("")
	const paddlePrice = ref("")

	const isLizhi = computed(() => config.lizhi.countries.includes(countryCode.value));
	const priceDisplay = computed(() => {
  	if (countryCode.value === "") {
			return "Loading price..."
		}
		function adjustPriceForDisplay(price) {
			return price.endsWith('.00') ? price.substring(0, price.length - 3) : price;
		}
		const price = isLizhi.value ? config.lizhi.price : adjustPriceForDisplay(paddlePrice.value);
		return `${getFlagEmoji(countryCode.value)} ${price}`
	});
	const buyLink = computed(() => isLizhi.value ? config.lizhi.storeUrl : "#!");
	const buyTarget = computed(() => isLizhi.value ? "_blank" : "");
	const masLink = computed(() => getMacAppStoreLink(
		config.apple.appId, config.apple.slug, appStoreCode.value
	));

	function buyClicked(event) {
		if (isLizhi.value) {
			console.log(`Not opening Paddle checkout`);
		} else {
			console.log("Opening Paddle checkout");
			Paddle.Checkout.open({ product: config.paddle.productId });
		}
	}

	function getFlagEmoji(countryCode) {
		const codePoints = countryCode
			.toUpperCase()
			.split('')
			.map(char => 127397 + char.charCodeAt());
		return String.fromCodePoint(...codePoints);
	}

	onMounted(async () => {
		loadScript("/external-js/setapp.js");

		// only call paddle setup when script is first loaded, not on subsequent navigations
		if (await loadScript("/external-js/paddle.js")) {
			Paddle.Setup({ vendor: config.paddle.vendorId, eventCallback: function(args) {
				console.log("Paddle event", args);
			}});
		}

		Paddle.Product.Prices(config.paddle.productId, function(prices) {
			console.log("paddle prices", prices);
			countryCode.value = prices.country;
			paddlePrice.value = prices.price.gross;
			const info = getCountryInfo(prices.country);
			console.log("getCountryInfo", info);
			countryName.value = info.countryName;
			appStoreCode.value = info.appStoreCode;
		});
	});
</script>

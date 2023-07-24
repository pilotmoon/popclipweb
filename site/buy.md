
# Purchase PopClip

## One-time Purchase

PopClip is available to buy as one-time purchase, either by buying a license
key, or via the Mac App Store.

<div class="container">
    <div class="box">
			<a href="#!" id="buy_license_link">Buy License Key</a>
		</div>
    <div class="box">
			<a href="https://apps.apple.com/app/popclip/id445189367?mt=12" id="buy_mas_link">Buy from Mac App Store</a>
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
import { onMounted } from 'vue'
import { loadScript } from '/buy-src/loadScript.ts'
import { masInfo } from '/buy-src/appstore.ts'
import * as config from '/buy-src/config.json'

onMounted(async () => {
	loadScript("/external-js/setapp.js");

  // only call paddle setup when script is first loaded, not on subsequent navigations
	if (await loadScript("/external-js/paddle.js")) {
		Paddle.Setup({ vendor: config.paddle.vendorId, eventCallback: function(args) {
			console.log("Paddle event", args);
		}});
	}

	function openCheckout() {
		console.log("openCheckout");
		Paddle.Checkout.open({ product: config.paddle.productId });
	}

	const buyLink = document.getElementById('buy_license_link');
	const masLink = document.getElementById('buy_mas_link');

	buyLink.addEventListener('click', openCheckout);

	Paddle.Product.Prices(config.paddle.productId, function(prices) {
		console.log(prices);
		let price = prices.price.gross;
		if (price.endsWith('.00')) {
			price = price.substring(0, price.length - 3);
		}
		if(prices.country === 'CN') {
			buyLink.textContent = 'Buy License Key (¥89)';
			buyLink.href = 'https://store.lizhi.io/site/products/id/612?cid=pchuiuf8';
			buyLink.removeEventListener('click', openCheckout);
		} else {
			buyLink.textContent = `Buy License Key (${price})`;
		}

		const info = masInfo(config.appstore.appId, prices.country);
		console.log(info);
		masLink.href = info.url;
	});
});
</script>

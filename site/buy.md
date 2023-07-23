---
head:
- - script
  - src: https://developer.setapp.com/setapp-banner/index.js
- - script
  - src: https://cdn.paddle.com/paddle/paddle.js   
- - script	
  - {}
  - |
    function setupPaddle() {
    Paddle.Setup({ vendor: 161988, eventCallback: function(args) {
    console.log("Paddle event", args);
    if (args.event === "Checkout.Close") {
    // remove the `#buy` fragment from the URL
    window.location.hash = "";
    }
    }});
    Paddle.Product.Prices(818494, function(prices) {
    console.log(prices);
    let price = prices.price.gross;
    if (price.endsWith('.00')) {
    price = price.substring(0, price.length - 3);
    }
    function openCheckout(coupon) {
    Paddle.Checkout.open({ product: 818494, coupon });
    }
    if(prices.country === 'CN') {
    document.getElementById('buy_license_link').textContent = 'Buy License Key (¥89)';
    document.getElementById('buy_license_link').href = 'https://store.lizhi.io/site/products/id/612?cid=pchuiuf8';
    } else {
    document.getElementById('buy_license_link').textContent = `Buy License Key (${price})`;
    }
    function checkHash() {
    console.log("checkHash", window.location.hash)
    const parts = /#buy(?:\?coupon=([A-Za-z0-9]+))?/.exec(window.location.hash);
    if (parts) {
    openCheckout(parts[1]);
    }
    }
    checkHash();
    window.addEventListener('hashchange', checkHash);		
    });
    }
    if (document.readyState === 'loading') {
    console.log("LOADINGG");
    document.addEventListener('DOMContentLoaded', setupPaddle);
    } else {
    console.log("GONOW");
    setupPaddle();
    }	  

---
# Purchase PopClip

## One-time Purchase

PopClip is available to buy as one-time purchase, either by buying a license
key, or via the Mac App Store.

<!-- markdownlint-disable MD033 -->
- <a href="#buy" id="buy_license_link">Buy License Key</a>
<!-- markdownlint-enable MD033 -->
- [Buy from Mac App Store](https://pilotmoon.com/link/popclip/mas)

## Subscribe

PopClip is also available as part of a
[Setapp subscription](https://go.setapp.com/stp304?refAppId=159&refVendorId=92).

<setapp-custom-banner
 iconUrl="https://store.setapp.com/app/159/7358/icon-1674034338-63c7bca20925e.png"
 appName="PopClip"
 appId="159"
 vendorId="92"
></setapp-custom-banner>

## Terms and Conditions

Your purchase is subject to the [Terms of License](/terms).

## Student Discount

Students can get a discount on PopClip via
[Student App Centre](https://studentappcentre.com/app/popclip).

## Purchase FAQs

**What are the differences between the Mac App Store edition, Standalone edition
and Setapp edition?** The editions are identical in features and abilities. The
only difference is the way you obtain the app and how you buy it.

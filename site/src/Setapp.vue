<script setup lang="ts">
// The Setapp promo banner, as a local component.
//
// Setapp supply this as a <setapp-custom-banner> web component loaded from
// developer.setapp.com. Rather than run their script (and let the page make
// third-party requests), the markup, styles, English text and artwork are
// extracted here by hand. Everything it loads — artwork, fonts, app icon —
// is served from this site. Re-extract from their bundle when they redesign:
//   https://developer.setapp.com/setapp-banner/index.js
// Last extracted: August 2026.

import { computed } from "vue";

interface Props {
  iconUrl?: string;
  appName?: string;
  appId?: string;
  vendorId?: string;
  pricePerMonth?: string;
}
const props = withDefaults(defineProps<Props>(), {
  iconUrl: "/icon512.png",
  appName: "PopClip",
  appId: "159",
  vendorId: "92",
  pricePerMonth: "14.99",
});

// Their English copy, with the same placeholders filled in.
const blurb = computed(
  () =>
    `Setapp is the best place to get apps. Get ${props.appName} on Setapp ` +
    `with dozens of other apps in one subscription for $${props.pricePerMonth}/mo ` +
    "+ tax. No extra fees, no ads.",
);

// Their link builder: source slug from the app name, campaign per click target.
const slug = computed(() => props.appName.toLowerCase().replace(/[^0-9a-zA-Z]/g, "_"));
function link(target: string) {
  const campaign = `${slug.value}_main_${target}`;
  const query = new URLSearchParams({
    refAppID: props.appId,
    stc: campaign,
    utm_campaign: campaign,
    utm_content: "banner",
    utm_medium: "vendor_program",
    utm_source: slug.value,
  });
  return `https://go.setapp.com/stp${props.vendorId}?${query}`;
}
const logoLink = computed(() => link("setapp_logo"));
const buttonLink = computed(() => link("banner"));
</script>

<template>
  <div :class="$style.banner">
    <div :class="$style.wrapper">
      <div :class="$style.illustration">
        <div :class="$style.imageHolder">
          <img :class="$style.boxBack" src="/setapp-box-back.svg" alt="" />
          <img :class="$style.image" :src="iconUrl" alt="" />
          <img :class="$style.boxFront" src="/setapp-box-front.svg" alt="" />
        </div>
      </div>
      <div :class="$style.content">
        <a :class="$style.logo" :href="logoLink" target="_blank" rel="noreferrer noopener">
          <img src="/setapp-logo.svg" height="44" width="236" alt="Setapp logo" />
        </a>
        <div>{{ blurb }}</div>
        <a :class="$style.button" class="no-icon" :href="buttonLink" target="_blank" rel="noreferrer noopener">Try Free</a>
      </div>
    </div>
  </div>
</template>

<style module>
/* Setapp's own typefaces, self-hosted so the banner makes no external calls.
   Fixel is MacPaw's, released free under the Open Font License, which permits
   this redistribution: https://fixel.macpaw.com/ */
@font-face {
  font-family: "FixelText";
  src: url("/fonts/FixelText-Medium.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "FixelDisplay";
  src: url("/fonts/FixelDisplay-Medium.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

.banner {
  margin: auto;
  border-radius: 20px;
  background-color: #3a3844;
  color: #fff;
  font-family: "FixelText", sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.4;
  letter-spacing: 0.5px;
  width: 100%;
  text-align: left;
}

.wrapper {
  padding: 0 40px;
}

@media (min-width: 768px) {
  .wrapper {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    padding-top: 0;
  }
}

.banner .logo {
  display: block;
  margin-bottom: 24px;
}

.content {
  flex: 1 1 0;
  padding: 40px 0;
}

.illustration {
  display: flex;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
}

.imageHolder {
  position: relative;
  width: 208px;
  height: 247px;
}

.boxBack {
  position: absolute;
  bottom: 104px;
  left: 21px;
}

.boxFront {
  position: absolute;
  bottom: -20px;
}

.image {
  position: absolute;
  width: 160px;
  top: 0;
  left: 0;
  right: 0;
  margin: auto;
}

.banner .button {
  display: inline-block;
  margin-top: 28px;
  padding: 11px 40px;
  font-family: "FixelDisplay", sans-serif;
  font-size: 16px;
  color: #26262b;
  text-decoration: none;
  background-color: #fff;
  border-radius: 6px;
  letter-spacing: 1px;
}

.banner .button:hover {
  color: #26262b;
  text-decoration: none;
}

/* The original rendered in a shadow root, so it never inherited the page's
   link and image styling. Restate what the theme would otherwise impose. */
.banner .logo,
.banner .logo:hover {
  text-decoration: none;
}

.banner img {
  max-width: none;
}
</style>

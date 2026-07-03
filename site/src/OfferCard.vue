<script setup lang="ts">
// A single product/offer card for the offer page: the shared card chrome
// (product line, title, ✅ bullets, the constant features row, price, CTA).
// All wording/pricing comes from props so the page can be driven by a data table.
interface Props {
  badge?: string;
  title: string;
  bullets: string[];
  listPrice?: string; // struck-through regular price (shown when discounted)
  priceLabel: string; // main price line: the actual price, or "Free"
  priceIsDiscount?: boolean; // true → brand style (used for "Free"); false → plain price
  taxNote?: string; // tax caption after the price, e.g. "+ tax"
  discountNote?: string; // brand-coloured "N% off" line under the price
  ctaLabel: string;
  ctaTheme?: "brand" | "alt";
  ctaSize?: "big" | "medium";
  footnote: string; // text before the "Full license terms" link
  claim: string; // backend claim opened when the CTA is clicked
  secondary?: boolean; // neutral border + slightly smaller (secondary card)
  busy?: boolean; // disables the CTA while a checkout is already in flight
}
withDefaults(defineProps<Props>(), {
  ctaTheme: "brand",
  ctaSize: "big",
  priceIsDiscount: true,
  busy: false,
});
defineEmits<{ (e: "buy", claim: string): void }>();
</script>

<template>
  <div :class="[$style.hero, secondary && $style.secondary]">
    <div v-if="badge" :class="$style.badge">{{ badge }}</div>
    <div :class="$style.product"><img src="/icon128.png" /> PopClip for macOS</div>
    <div :class="$style.title">{{ title }}</div>
    <div :class="$style.bullets">
      <template v-for="(bullet, i) in bullets" :key="i">✅ {{ bullet }}<br /></template>
    </div>
    <div :class="$style.features">
      <span :class="$style.feature"><span :class="$style.featureIcon">💻</span> Use on up to 5 Macs</span>
      <span :class="$style.feature"><span :class="$style.featureIcon">☁️</span> Free iCloud sync</span>
    </div>
    <div :class="$style.priceArea">
      <div v-if="listPrice || discountNote" :class="$style.priceWas">
        <span v-if="listPrice" :class="$style.listPrice">{{ listPrice }}</span>
        <span v-if="discountNote" :class="$style.discountNote">{{ discountNote }}</span>
      </div>
      <div :class="$style.prices">
        <span :class="priceIsDiscount ? $style.discount : $style.price">{{ priceLabel }}</span>
        <span v-if="taxNote" :class="$style.tax">{{ taxNote }}</span>
      </div>
    </div>
    <AaButton :class="$style.buybutton" @click="$emit('buy', claim)" :theme="ctaTheme" :size="ctaSize" :disabled="busy">{{ ctaLabel }}</AaButton>
    <div :class="$style.small">{{ footnote }} <a href="/terms">Full license terms</a>.</div>
  </div>
</template>

<style module>
.hero {
  background-color: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 12px;
  max-width: 32em;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

/* Secondary product card: same chrome but a neutral border and slightly smaller,
   used for the license-renewal option. */
.secondary {
  border: 1px solid var(--vp-c-border);
  margin-top: 12px;
  max-width: 27em;
  padding: 16px 18px;
}

.badge {
  display: inline-block;
  background-color: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
  padding: 3px 12px;
  margin-bottom: 12px;
}

.hero .product {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  gap: 4px;
  margin-bottom: 4px;
}

.hero img {
  display: inline-block;
  height: 24px;
}

.hero .title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
}

.bullets {
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 6px;
}

.features {
  display: flex;
  justify-content: center;
  gap: 18px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 14px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 4px;
}

.featureIcon {
  font-size: 14px;
  filter: grayscale(1);
  opacity: 0.65;
}

.priceArea {
  margin-bottom: 14px;
}

/* Top line: struck-through original price + the brand "N% off" note. */
.priceWas {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

/* Bottom line: the actual price (+ tax). */
.prices {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 10px;
}

/* Brand-coloured "N% off" note, shown next to the struck-through original price. */
.discountNote {
  color: var(--vp-c-brand-1);
  font-weight: 700;
  font-size: 15px;
}

.listPrice {
  font-size: 16px;
  text-decoration: line-through;
  color: var(--vp-c-text-2);
}

.discount {
  font-size: 17px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

/* Actual (non-discounted-style) price, e.g. the discounted total or the renewal price. */
.price {
  font-size: 17px;
  font-weight: 700;
}

.tax {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.buybutton {
  text-decoration: none;
}

.hero .small {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 10px;
}
</style>

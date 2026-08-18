<script setup lang="ts">
import regionalPricing from "./data/regionalPricing";
import { getCountryInfo } from "./helpers/countries/getCountryInfo";
import { getFlagEmoji } from "./helpers/getFlagEmoji";

// One row per tier, with its countries listed inline (alphabetical). The tier
// names themselves (mid/low-income) deliberately aren't shown: the discount is
// the useful fact, and the prose above explains the reasoning.
const rows = regionalPricing.tiers.map((tier) => ({
  discountPercent: tier.discountPercent,
  countries: tier.countries
    .map((code) => ({ code, name: getCountryInfo(code).countryName || code, flag: getFlagEmoji(code) }))
    .sort((a, b) => a.name.localeCompare(b.name)),
}));
</script>

<template>
  <div :class="$style.tableWrap">
  <table :class="$style.table">
    <thead>
      <tr>
        <th>Adjustment</th>
        <th>Countries</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.discountPercent">
        <td :class="$style.nowrap">{{ row.discountPercent }}% lower</td>
        <td>
          <template v-for="(country, i) in row.countries" :key="country.code"
            ><span :class="$style.nowrap">{{ country.flag }} {{ country.name }}</span
            ><template v-if="i < row.countries.length - 1">, </template></template
          >
        </td>
      </tr>
    </tbody>
  </table>
  </div>
</template>

<style module>
/* VitePress renders tables as scrollable blocks sized to content; restore real
   table layout at container width so the countries wrap instead of overflowing
   into a horizontal scroll on narrow screens. The `.tableWrap` prefix raises
   specificity above VitePress's `.vp-doc table` rule. */
.tableWrap .table {
  display: table;
  width: 100%;
}

/* Keep each "🇧🇷 Brazil" pair and the tier/discount phrases unbroken when the row wraps. */
.nowrap {
  white-space: nowrap;
}
</style>

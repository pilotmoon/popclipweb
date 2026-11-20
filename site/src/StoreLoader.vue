<script setup type="ts">
import { onMounted } from 'vue'
import { loadStore } from './composables/useStoreState'

onMounted(() => {
    // background: a page's own load (e.g. the buy page's sale prices)
    // always takes precedence over this site-wide prefetch
    loadStore(undefined, { background: true });
});
</script>

<template>
  <div id="store-loader" />
</template>

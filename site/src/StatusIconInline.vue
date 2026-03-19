<script setup lang="ts">
import InlineIcon from "./InlineIcon.vue";
</script>

<template>
  <span :class="$style.root">
    <InlineIcon spec="bundle:status-icon-thicker" />
  </span>
</template>

<style module>
.root {
  white-space: nowrap;
}

.root :global(img.InlineIcon) {
  box-sizing: border-box;
  padding: 0.13em;
}
</style>

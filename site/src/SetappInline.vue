<script setup lang="ts">
import { SetappIcon } from 'vue3-simple-icons'
</script>

<template>
  <span :class="$style.root">
    <SetappIcon :class="$style.icon" />
    <span :class="$style.label"><slot /></span>
  </span>
</template>

<style module>
.root {
  white-space: nowrap;
}

.icon {
  fill: currentColor;
  display: inline-block;
  height: 0.92em;
  width: auto;
  margin: 0 -0.32em 0 -0.12em;
  vertical-align: -0.08em;
}

.label {
  display: inline;
  margin-left: 0.32em;
}
</style>

<script setup lang="ts">
import { data as browsers } from "../kb/browsers.data.ts";

// Optionally list browsers that do NOT support "Page Info"
// and optionally include preview/dev browsers
const props = defineProps<{ unsupported?: boolean; includePreview?: boolean }>();

const names = browsers.browsers
  // hide preview/dev browsers by default
  .filter((b) => !b.isVariant || props.includePreview)
  // then filter by Page Info support
  .filter((b) => (props.unsupported ? !b.supportsPageInfo : b.supportsPageInfo))
  .map((b) => b.name);
</script>

<template>
  <span>{{ names.join(", ") }}</span>
</template>

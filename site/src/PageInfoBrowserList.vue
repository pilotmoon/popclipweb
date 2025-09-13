<script setup lang="ts">
import { data as browsers } from "../kb/browsers.data.ts";

// Optionally list browsers that do NOT support "Page Info"
const props = defineProps<{ unsupported?: boolean }>();

const names = browsers.browsers
  .filter((b) => (props.unsupported ? !b.supportsPageInfo : b.supportsPageInfo))
  .map((b) => b.name);
</script>

<template>
  <span>{{ names.join(", ") }}</span>
</template>

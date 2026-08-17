<script setup lang="ts">
import { data } from "./data/releases.data.ts";

const props = defineProps<{
  // render the integer build number (e.g. 5997) instead of the
  // display version string (e.g. 2026.7.1)
  build?: boolean;
}>();

// the most recent production release
const latest = data.production[0];
const text = props.build
  ? String(latest.version ?? latest.versionString)
  : latest.versionString;
</script>

<template>
  <span>{{ text }}</span>
</template>

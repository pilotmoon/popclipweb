<script setup lang="ts">
import { data } from "./data/releases.data.ts";

// Get the most recent production release
const latestVersion = data.production[0].versionString;
</script>

<template>
  <span>{{ latestVersion }}</span>
</template>

<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";
import { showsTwinLink } from "../.vitepress/llmPages";

// A small "View as Markdown" link at the top of developer-focused pages
// that have a plain-Markdown twin (see llmDocs.ts). target="_self" keeps
// the SPA router from intercepting the navigation, as with the /dev/api/
// links.
const { page } = useData();
const href = computed(() =>
  showsTwinLink(page.value.relativePath)
    ? `/${page.value.relativePath}`
    : undefined,
);
</script>

<template>
  <div v-if="href" class="MarkdownTwinLink">
    <a :href="href" target="_self" title="Plain Markdown version of this page"
      >View as Markdown</a
    >
  </div>
</template>

<style scoped>
.MarkdownTwinLink {
  text-align: right;
  font-size: 12px;
  line-height: 1;
}
.MarkdownTwinLink a {
  color: var(--vp-c-text-3);
  transition: color 0.25s;
}
.MarkdownTwinLink a:hover {
  color: var(--vp-c-brand-1);
}
</style>

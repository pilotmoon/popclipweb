<script setup lang="ts">
import { data as directoryData } from "./data/directory.data";
import { data as exts } from "./data/extensions.data";

const categoryDefs = directoryData.categories;

// listed members per category
const counts = new Map<string, number>();
for (const ext of exts) {
  if (ext.unlisted || !ext.category) continue;
  counts.set(ext.category, (counts.get(ext.category) ?? 0) + 1);
}
</script>

<template>
  <div :class="$style.Breadcrumb">
    <a href="/extensions/">PopClip Extensions Directory</a> / Categories
  </div>
  <h1 :class="$style.Title">Categories</h1>
  <ul :class="$style.List">
    <li v-for="def in categoryDefs" :key="def.slug">
      <a :href="`/extensions/categories/${def.slug}`">{{ def.title }}</a>
      <span :class="$style.Count"
        >{{ counts.get(def.slug) ?? 0 }}
        {{ (counts.get(def.slug) ?? 0) === 1 ? "extension" : "extensions" }}</span
      >
    </li>
  </ul>
</template>

<style module>
.Breadcrumb {
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
}
.Breadcrumb a {
  text-decoration: none;
}

.Title {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 0 16px;
}

/* doubled selector out-specifies the theme's .vp-doc ul, which
   otherwise wins and adds bullets and indent */
.List.List {
  list-style: none;
  padding: 0;
  margin: 0;
}
.List li {
  margin: 4px 0;
}
.List a {
  text-decoration: none;
}
.List a:hover {
  text-decoration: underline;
}

/* same shape as the authors index's count */
.Count {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin-left: 6px;
}
</style>

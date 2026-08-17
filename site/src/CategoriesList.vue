<script setup lang="ts">
import { data as directoryData } from "./data/directory.data";

const categoryDefs = directoryData.categories;
</script>

<template>
  <div :class="$style.Breadcrumb">
    <a href="/extensions/">← PopClip Extensions Directory</a>
  </div>
  <h1 :class="$style.Title">Categories</h1>
  <ul :class="$style.List">
    <li v-for="def in categoryDefs" :key="def.slug">
      <a :href="`/extensions/categories/${def.slug}`">{{ def.title }}</a>
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

.List {
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
</style>

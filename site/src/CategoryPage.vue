<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";
import type { CategoryPageDef } from "../extensions/categories/[slug].paths";
import type { ExtInfo } from "./data/extensionInfo.js";
import { data as exts } from "./data/extensions.data";
import DirectoryEntry from "./DirectoryEntry.vue";

const { params } = useData();
const category = params.value as unknown as CategoryPageDef;

// the category's listed members: an unlisted extension may carry a
// category (staged for when it is listed), but only listed ones belong
// here. flagships first, then the rest, each group A-Z -- the same
// order as the front page's section
const extensions = computed<ExtInfo[]>(() =>
  (exts as ExtInfo[])
    .filter((ext) => !ext.unlisted && ext.category === category.slug)
    .sort(
      (a, b) =>
        (b.flagship ? 1 : 0) - (a.flagship ? 1 : 0) ||
        a.name.localeCompare(b.name),
    ),
);
</script>

<template>
  <div :class="$style.Breadcrumb">
    <a href="/extensions/">← PopClip Extensions Directory</a>
  </div>

  <div :class="$style.Main">
    <h1 :class="$style.Name">{{ category.title }}</h1>
    <p v-if="category.description" :class="$style.Description">
      {{ category.description }}
    </p>
  </div>

  <div :class="$style.Card">
    <div :class="$style.CardHeader">
      {{ extensions.length }}
      {{ extensions.length === 1 ? "Extension" : "Extensions" }}
    </div>
    <DirectoryEntry v-for="ext in extensions" :key="ext.id" :ext="ext" />
    <p v-if="!extensions.length" :class="$style.Empty">
      Nothing in this category yet.
    </p>
  </div>
</template>

<style module>
.Breadcrumb {
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
}
.Breadcrumb a {
  text-decoration: none;
}

.Main {
  margin-bottom: 32px;
}

.Name {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
}

.Description {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
}

.Card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.CardHeader {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  margin-bottom: 12px;
}

.Empty {
  margin: 0;
  color: var(--vp-c-text-2);
}
</style>

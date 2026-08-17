<script setup lang="ts">
import { computed } from "vue";
import { authorName, authorPath } from "./data/authorLinks.js";
import { data as authors } from "./data/authors.data";
import type { ExtInfo } from "./data/extensionInfo.js";
import { data as exts } from "./data/extensions.data";

// authors with at least one published extension, alphabetically. counts
// include unlisted extensions, matching what each author's page shows.
const rows = computed(() => {
  const counts = new Map<number, number>();
  for (const ext of exts as ExtInfo[]) {
    const id = Number(ext.owner?.match(/^github:(\d+)$/)?.[1]);
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return authors
    .map((author) => ({ author, count: counts.get(author.githubId) ?? 0 }))
    .filter((row) => row.count > 0)
    .sort((a, b) => authorName(a.author).localeCompare(authorName(b.author)));
});
</script>

<template>
  <div :class="$style.Links">
    <a href="/extensions/">PopClip Extensions Directory</a> / Authors
  </div>

  <h1>Authors Index</h1>

  <div class="info custom-block">
    <p>
      Get your own author page here! See
      <a href="/extensions/submit">Submit an Extension</a>.
    </p>
  </div>

  <ul :class="$style.Authors">
    <li v-for="row in rows" :key="row.author.id" :class="$style.Author">
      <a :class="$style.Name" :href="authorPath(row.author)">{{ authorName(row.author) }}</a>
      <!-- the row name is already the link to the author page, so show
           the github identity as plain marked-up text. shown for every
           author, even when it repeats a name-less author's handle, so
           that every row has the same shape -->
      <span :class="$style.Handle">
        <AaLink :href="row.author.githubUrl" no-link />
      </span>
      <span :class="$style.Count">{{ row.count }} {{ row.count === 1 ? "extension" : "extensions" }}</span>
    </li>
  </ul>
</template>

<style module>
.Links {
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
}
.Links a {
  text-decoration: none;
}

.Authors {
  list-style: none;
  padding: 0;
  margin: 24px 0 0;
}

.Author {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: baseline;
  padding: 0;
  margin: 0 0 8px;
}

.Name {
  font-weight: 600;
  text-decoration: none;
}
.Name:hover {
  text-decoration: underline;
}

.Handle,
.Count {
  font-size: 14px;
  color: var(--vp-c-text-2);
}
</style>

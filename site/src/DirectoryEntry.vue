<script setup lang="ts">
import Icon from "./Icon.vue";
import { withBase } from "vitepress";
import { computed } from "vue";
import type { ExtInfo } from "./data/extensionInfo";
import {
  authorByOwner,
  authorName,
  authorPath,
  isOwnAuthor,
} from "./data/authorLinks.js";
import { data as authors } from "./data/authors.data";
const props = withDefaults(
  defineProps<{
    ext: ExtInfo;
    // author pages pass false: every entry there shares one author
    byline?: boolean;
  }>(),
  { byline: true },
);
// absolute, so entries work from anywhere: the directory index and
// author pages sit at different depths
const href = computed(() => withBase(`/extensions/x/${props.ext.shortcode}`));
// same attribution rule as the extension page: contributed extensions
// get a byline, our own do not
const bylineAuthor = computed(() => {
  if (!props.byline) return null;
  const author = authorByOwner(authors, props.ext.owner);
  return author && !isOwnAuthor(author) ? author : null;
});
const newDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
// new to the DIRECTORY, keyed off the first-listed date: an extension can
// be published (own page only) long before it is curated into the index,
// and the badge should not have burned out by then. never-listed
// extensions (e.g. on author pages) get no badge. firstListed may arrive
// as a Date or, via a data loader's JSON round-trip, a string.
function isNew(ext: ExtInfo) {
  return (
    ext.firstListed != null && new Date(ext.firstListed).getTime() > newDate
  );
}
</script>

<template>
  <div :class="$style.DirectoryEntry" v-once>
    <div :class="$style.EntryDownload">
      <DownloadButton
        theme="bare"
        size="smaller"
        :href="props.ext.download"
        icon-only
      />
    </div>
    <div :class="$style.EntryIcon">
      <a :href="href">
        <Icon v-if="props.ext.icon" :spec="props.ext.icon" :height="64" />
      </a>
    </div>
    <div :class="$style.EntryMain">
      <a :class="$style.EntryName" :href="href">
        <div :class="$style.EntryName">{{ props.ext.name }}</div>
      </a>
      <span v-if="bylineAuthor" :class="$style.EntryByline"
        >by
        <a :href="authorPath(bylineAuthor)">{{
          authorName(bylineAuthor)
        }}</a></span
      >
      <span :class="$style.EntryFlash" v-if="isNew(props.ext)">New!</span>
      <span
        :class="$style.EntryUnlisted"
        v-if="props.ext.unlisted"
        title="Published in the directory but not selected for the main index"
        >Unlisted</span
      >
      <div :class="$style.EntryDescription" v-html="props.ext.description" />
    </div>
  </div>
</template>

<style module>
.DirectoryEntry {
  display: flex;
  align-items: center;

  gap: 12px;
  margin-bottom: 8px;
}

.EntryDownload {
  display: flex;
  align-items: center;
}

.EntryIcon {
  display: flex;
  align-items: center;

  font-size: 20px;
  width: 24px;
  opacity: 0.7;
}

.EntryIcon img {
  width: 24px;
}

.EntryMain {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  min-width: 0;
  /* Somehow this makes the truncation on the child element work */

  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: start;
}

.EntryMain a {
  text-decoration: none;
}

.EntryMain a:hover {
  text-decoration: underline;
}

.EntryName {
  font-weight: 600;
  font-size: 16px;

  flex-shrink: 0;
  flex-basis: auto;
}

.EntryFlash {
  font-size: 10px;
  color: var(--vp-c-red-2);
  font-weight: 600;
  align-self: flex-start;
  margin-top: -3px;
  margin-left: -6px;
}

.EntryByline {
  font-size: 12px;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  margin-left: -6px;
}
.EntryByline a {
  color: inherit;
}

/* same shape as the New! flash, but muted: a fact, not a fanfare */
.EntryUnlisted {
  font-size: 10px;
  color: var(--vp-c-text-3);
  font-weight: 600;
  align-self: flex-start;
  margin-top: -3px;
  margin-left: -6px;
}

.EntryDescription {
  font-size: 14px;

  /* Truncate text with ellipsis */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  flex-shrink: 1;
  flex-basis: auto;
}

@media (max-width: 550px) {
  .EntryDownload {
    display: none;
  }
}
</style>
./data/extensions.data

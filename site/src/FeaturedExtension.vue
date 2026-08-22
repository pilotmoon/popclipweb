<script setup lang="ts">
import { withBase } from "vitepress";
import { computed } from "vue";
import Icon from "./Icon.vue";
import type { ExtInfo } from "./data/extensionInfo";
import {
  authorByOwner,
  authorName,
  authorPath,
  isOwnAuthor,
} from "./data/authorLinks.js";
import { data as authors } from "./data/authors.data";
import { data as directoryData } from "./data/directory.data";

const props = defineProps<{ ext: ExtInfo }>();
const href = computed(() => withBase(`/extensions/x/${props.ext.shortcode}`));
// same attribution rule as everywhere else: contributed extensions get
// a byline, our own do not
// the extension's category, for a secondary line with a link through
const category = computed(() =>
  props.ext.category
    ? (directoryData.categories.find((c) => c.slug === props.ext.category) ??
      null)
    : null,
);
const bylineAuthor = computed(() => {
  const author = authorByOwner(authors, props.ext.owner);
  return author && !isOwnAuthor(author) ? author : null;
});
</script>

<template>
  <div :class="$style.Featured">
    <div :class="$style.Text">
      <div :class="$style.Label">Featured</div>
      <!-- the icon and title go to the extension's page, but quietly:
           plain text, no link colour, like the icon in the rows. the
           buttons below are the announced ways onward -->
      <div :class="$style.Title">
        <a v-if="props.ext.icon" :class="$style.Icon" :href="href">
          <Icon :spec="props.ext.icon" :height="64" />
        </a>
        <div>
          <a :class="$style.Name" :href="href">{{ props.ext.name }}</a>
          <div v-if="bylineAuthor" :class="$style.Byline">
            by <a :href="authorPath(bylineAuthor)">{{ authorName(bylineAuthor) }}</a>
          </div>
        </div>
      </div>
      <div :class="$style.Description" v-html="props.ext.description" />
      <!-- the footer row: quiet text links on the left (the extension's
           page, and its category), and the one button, download, on the
           right -- the rows' button a size up and with its label -->
      <div :class="$style.Footer">
        <div :class="$style.Links">
          <a :href="href">Learn more</a>
          <!-- the dot travels with the second link, so when the two wrap
               it leads the new line like a bullet rather than dangling
               at the end of the first -->
          <span v-if="category" :class="$style.WithDot">
            <span :class="$style.Dot">·</span>
            <a :href="`/extensions/categories/${category.slug}`"
              >See all in {{ category.title }}</a
            >
          </span>
        </div>
        <DownloadButton theme="alt" size="small" :href="props.ext.download" />
      </div>
    </div>
    <div :class="$style.Media" v-if="props.ext.demo">
      <video :src="props.ext.demo" autoplay loop playsinline muted>
        Browser can't show this video.
      </video>
    </div>
  </div>
</template>

<style module>
.Featured {
  display: flex;
  gap: 20px;
  /* stretch, not center: the text column runs the full height of the
     box so its buttons can sit at the bottom; everything else starts
     at the top */
  align-items: stretch;
  margin: 16px 0 0;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  /* the video runs edge to edge on the right; the box's own radius
     clips its corners */
  overflow: hidden;
}

.Text {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

/* same voice as the extension page's card headers */
.Label {
  color: var(--vp-c-text-2);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.Title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.Icon {
  display: flex;
  align-items: center;
  width: 40px;
  flex-shrink: 0;
  opacity: 0.85;
}
.Icon img {
  width: 40px;
}

/* nested selectors: vitepress styles links under .vp-doc with enough
   specificity to override a lone class */
.Featured .Text .Name {
  display: inline-block;
  font-weight: 600;
  font-size: 20px;
  color: inherit;
  text-decoration: none;
}
.Featured .Text .Name:hover {
  text-decoration: underline;
}

.Byline {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-top: 2px;
}
.Byline a {
  color: inherit;
  text-decoration: none;
}
.Byline a:hover {
  text-decoration: underline;
}

.Description {
  font-size: 14px;
  margin-top: 8px;
}
/* app links in the description: underlined but in the text colour, so
   the box reads as one piece rather than a scatter of blue. nested
   selector to outrank vp-doc's link styling */
.Featured .Text .Description a {
  color: inherit;
  text-decoration: underline;
}

/* pinned to the bottom of the text column: links left, button right */
.Footer {
  margin-top: auto;
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.Links {
  font-size: 13px;
  /* tight lines when the two links wrap; vp-doc's body line-height is
     generous for prose but leaves these two looking estranged */
  line-height: 1.4;
  color: var(--vp-c-text-2);
  display: flex;
  align-items: baseline;
  column-gap: 6px;
  row-gap: 2px;
  flex-wrap: wrap;
}
.Featured .Links a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--vp-c-text-3);
}
.Featured .Links a:hover {
  color: var(--vp-c-text-1);
}
.WithDot {
  white-space: nowrap;
}
.Dot {
  color: var(--vp-c-text-3);
  margin-right: 6px;
}

/* the video sets the box's height and sits flush with its top, right
   and bottom edges; straight-sided on the left */
.Media {
  flex: 0 0 auto;
  max-width: 50%;
  display: flex;
}
.Media video {
  display: block;
  height: 200px;
  width: auto;
  max-width: 100%;
  object-fit: cover;
}

@media (max-width: 640px) {
  .Featured {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }
  .Media {
    max-width: none;
  }
  .Media video {
    height: auto;
    width: 100%;
  }
}
</style>

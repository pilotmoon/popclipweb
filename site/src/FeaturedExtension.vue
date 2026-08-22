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

const props = defineProps<{ ext: ExtInfo }>();
const href = computed(() => withBase(`/extensions/x/${props.ext.shortcode}`));
// same attribution rule as everywhere else: contributed extensions get
// a byline, our own do not
const bylineAuthor = computed(() => {
  const author = authorByOwner(authors, props.ext.owner);
  return author && !isOwnAuthor(author) ? author : null;
});
</script>

<template>
  <div :class="$style.Featured">
    <div :class="$style.Text">
      <div :class="$style.Label">Featured</div>
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
      <!-- the same button the rows use, a size up and with its label:
           present without shouting -->
      <div :class="$style.Download">
        <DownloadButton theme="alt" size="small" :href="props.ext.download" />
      </div>
    </div>
    <div :class="$style.Media" v-if="props.ext.demo">
      <a :href="href" :aria-label="`${props.ext.name} demo`">
        <video :src="props.ext.demo" autoplay loop playsinline muted>
          Browser can't show this video.
        </video>
      </a>
    </div>
  </div>
</template>

<style module>
.Featured {
  display: flex;
  gap: 20px;
  align-items: center;
  margin: 16px 0 0;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
}

.Text {
  flex: 1 1 0;
  min-width: 0;
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

.Name {
  display: inline-block;
  font-weight: 600;
  font-size: 20px;
  text-decoration: none;
}
.Name:hover {
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

.Download {
  margin-top: 12px;
}

.Media {
  flex: 0 0 auto;
  max-width: 50%;
}
.Media video {
  display: block;
  max-height: 180px;
  max-width: 100%;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .Featured {
    flex-direction: column;
    align-items: stretch;
  }
  .Media {
    max-width: none;
  }
  .Media video {
    max-height: none;
    width: 100%;
  }
}
</style>

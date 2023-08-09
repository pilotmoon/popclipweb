<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import DownloadButton from './DownloadButton.vue'
import { computed } from 'vue';
import { data } from './data/releases.data';
import { formatDate, formatSize } from './helpers/formatters';
const props = defineProps<{
  channel?: "production" | "beta"
}>();

// markdown rendering (with html passed through)
const md = new MarkdownIt({
  html: true,
});
function renderMarkdown(markdown: string) {
  return md.render(markdown);
}

const releases = computed(() => {
  return data[props.channel ?? "production"];
});

</script>

<template>
    <div :class="$style.changelog">
      <div v-for="(release, index) in releases" :key="release.versionString" :class="$style.changelogEntry">
        <h2>{{ release.versionString }}
          <span v-if="release.version && !release.versionString.endsWith(String(release.version))"
            :class="$style.smaller">({{ release.version }})&nbsp;</span>
          <span :class="$style.smaller"> {{ formatDate(release.date) }}</span>
        </h2>
        <span v-if="release.url && release.size && !release.zap && (release.pin || index < 5)">
          <DownloadButton :url="release.url" type="secondary" />&nbsp;
          <span v-if="release.size"><span>{{ formatSize(release.size) }}</span>&nbsp;</span>
        </span>
        <span v-if="release.minimumSystemVersion"><span :class="$style.info">≥ macOS {{ release.minimumSystemVersion
        }}</span>&nbsp;</span>
        <span v-if="release.archs?.includes('i386')"><span :class="$style.info">Intel 32-bit</span>&nbsp;</span>
        <span v-if="release.archs?.includes('x86_64')"><span :class="$style.info">Intel 64-bit</span>&nbsp;</span>
        <span v-if="release.archs?.includes('arm64')"><span :class="$style.info">Apple Silicon</span>&nbsp;</span>

        <div v-html="renderMarkdown(release.description)"></div>
      </div>
    </div>

</template>

<style module>
:root {
  --line-height: 1.7;
}

.smaller {
  font-size: 0.9em;
  font-weight: 400;
}

.changelogEntry ul {
  left: 1em;
}

.changelogEntry li {
  margin: 0;
  line-height: var(--line-height);
}

.changelogEntry p {
  line-height: var(--line-height);
}

.changelogEntry li+li {
  margin: 0;
}

.changelogEntry h3 {
  line-height: var(--line-height);
  font-size: 1em;
}

.changelog .info {
  word-wrap: no-wrap;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  padding: 0.1em 0.5em;
  border-radius: 16px;
}</style>
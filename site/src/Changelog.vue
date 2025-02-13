<script setup lang="ts">
import MarkdownIt from "markdown-it";
import { computed } from "vue";
import { data } from "./data/releases.data";
import { formatDate, formatSize } from "./helpers/formatters";
import { ElTag } from "element-plus";
const props = defineProps<{
  channel?: "production" | "beta";
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
    <div
      v-for="(release, index) in releases"
      :key="release.versionString"
      :class="$style.changelogEntry"
    >
      <h2>
        {{ release.versionString }}
        <span
          v-if="
            release.version &&
            !release.versionString.endsWith(String(release.version))
          "
          :class="$style.smaller"
          >({{ release.version }})</span
        >
        <span :class="$style.smaller"
          >&ensp;{{ formatDate(release.date) }}</span
        >
      </h2>
      <div :class="$style.info">
        <DownloadButton
          v-if="
            release.url &&
            release.size &&
            !release.zap &&
            (release.pin || index < 5)
          "
          :href="release.url"
          size="smaller"
          theme="outline"
        />
        <ElTag v-if="release.size" type="">{{
          formatSize(release.size)
        }}</ElTag>
        <ElTag v-if="release.minimumSystemVersion" type="success"
          >≥ macOS {{ release.minimumSystemVersion }}</ElTag
        >
        <ElTag v-if="release.archs?.includes('i386')" type="warning"
          >Intel 32-bit</ElTag
        >
        <ElTag v-if="release.archs?.includes('x86_64')" type="warning"
          >Intel 64-bit</ElTag
        >
        <ElTag v-if="release.archs?.includes('arm64')" type="warning"
          >Apple Silicon</ElTag
        >
      </div>
      <div v-html="renderMarkdown(release.description)"></div>
    </div>
  </div>
</template>

<style module>
:root {
  --line-height: 1.7;
}

.info {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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

.changelogEntry li + li {
  margin: 0;
}

.changelogEntry h3 {
  line-height: var(--line-height);
  font-size: 1em;
}
</style>

<script setup lang="ts">
import { useData } from "vitepress";
import { useSlots } from "vue";
import Icon from "./Icon.vue";
import type { ExtInfo, PartialExtInfo } from "./data/extensionInfo.js";
import { formatDate } from "./helpers/formatters.js";

const { params } = useData();

const ext: ExtInfo = {
  ...params.value,
  firstCreated: new Date(params.value?.firstCreated),
  created: new Date(params.value?.created),
  sourceDate: params.value?.sourceDate ? new Date(params.value?.sourceDate) : null,
  previousVersions: params.value?.previousVersions.map((pv: PartialExtInfo) => ({
    ...pv,
    sourceDate: pv.sourceDate ? new Date(pv.sourceDate) : null,
  })),
} as ExtInfo;
const slots = useSlots();
const hasReadme = typeof slots.default?.()?.[0]?.type === "string";

console.log("ext", ext);
</script>

<template>
  <div :class="$style.Breadcrumb">
    <!-- ← <a href="/extensions/">Back to Directory</a> -->
    <a href="/extensions/">← PopClip Extensions Directory</a>
  </div>

  <div :class="$style.Main">
    <h1>
      <Icon v-if="ext.icon" :spec="ext.icon" :height=64 />
      {{ ext.name }}
    </h1>

    <div :class="$style.SideBySide">
      <div :class="$style.Description" v-html="ext.description"></div>
      <div :class="$style.Download">
        <DownloadButton size="small" :href="ext.download" />
      </div>
    </div>

    <div v-if=ext.altStrings :class="$style.AltStrings" style="color: var(--vp-c-text-2)">
      <span v-for="alt in ext.altStrings" :key="alt.lang">
        <span :class="$style.Subdued">{{ alt.lang }}</span>
        <b v-if="alt.name">{{ alt.name }}</b>
        <span v-if="alt.description">{{ alt.description }}</span>
      </span>
    </div>
    
  </div>

  <div v-if="ext.demo" :class="$style.Card">
    <div :class="$style.CardHeader">Demo</div>
    <img v-if="ext.demo.endsWith('.gif')" :src="ext.demo" alt="Demo Animated GIF" />
    <video v-if="ext.demo.endsWith('.mp4')" :src="ext.demo" alt="Demo Video" autoplay loop playsinline>Browser can't show this video.</video>
  </div>

  <div v-if="hasReadme" :class="$style.Card">
    <div :class="$style.CardHeader">Readme</div>
    <div v-if="hasReadme" :class="$style.Readme">
      <slot />
    </div>
    <div v-else>
      The extension author did not provide a Readme file.
    </div>
  </div>

  <div :class="$style.Card">
    <div :class="$style.CardHeader">Info</div>
    <ul :class="$style.CardData">
      <!--<li><span :class="$style.CardDataLabel">First Published</span><br><span>{{ formatDate(ext.firstCreated.toISOString()) }}</span></li> -->
      <li v-if=ext.sourceDate><span :class="$style.CardDataLabel">Updated</span><br><span>{{ formatDate(ext.sourceDate.toISOString()) }}</span></li>
      <li><span :class="$style.CardDataLabel">Version</span><br><span>{{ ext.version}}</span></li>
      <li><span :class="$style.CardDataLabel">Identifier</span><br><code>{{ ext.identifier }}</code></li>      
      <li><span :class="$style.CardDataLabel">Source</span><br>
        <AaLink :href="ext.source" />
      </li>
    </ul>
  </div>

  <div v-if=ext.previousVersions.length :class="$style.Card">
    <div :class="$style.CardHeader">Previous Versons</div>
    <ul :class="$style.CardData">
      <li v-for="ver in ext.previousVersions" :key="ver.version">
        Version {{ ver.version }} <span :class="$style.small">({{ formatDate(ver.sourceDate) }}<span v-if="ver.name!==ext.name">, as "{{ ver.name }}"</span>)</span>: <a v-if=ver.source :href=ver.source>Source</a>, <a v-if=ver.download :href=ver.download>Download</a>
      </li>
    </ul>
  </div>
</template>

<style module>

.Small {
  font-size: 14px;
}
.Subdued {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.Breadcrumb {
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
}

.Main {
  margin-bottom: 32px;
}

.Main h1 {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}

.Main h1 img {
  opacity: 0.7;
  width: 40px;
}

.SideBySide {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: bottom;
  gap: 16px;

  margin: 24px 0 0px;
}

.SideBySide .Description {
  font-size: 18px;
  line-height: 28px;
  font-weight: 400;
  margin: 0;
}

.SideBySide .Download {
  padding-top: 8px;
}

.AltStrings {
  margin: 16px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: flex-start;
  gap: 0 16px;
}

.AltStrings > span {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: flex-start;
  gap: 8px;
}

@media (max-width: 550px) {
  .SideBySide {
    flex-direction: column;
  }

  .SideBySide .Download {
    text-align: right;
    padding-top: 0;
  }
}

.Card {
  margin: 16px 0 0;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
}

.CardHeader {
  color: var(--vp-c-text-2);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

ul.CardData {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: flex-start;
  gap: 6px 24px;
  list-style: none;
  padding-left: 0;
}

ul.CardData li {
  margin: 0;
}

ul.CardData code {
  color: var(--vp-c-text-2);
}

.CardDataLabel {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.Card>img {
  border-radius: 8px;
}

/* ---
.Readme
  Geometry is a little tighter then vp-doc
--- */

.Readme {
  background-color: var(--vp-c-bg);
  padding: 12px;
  border-radius: 8px;
}

.Readme h1 {
  margin: 12px 0 24px;
  line-height: 30px;
  font-size: 24px;
}

.Readme h2 {
  margin: 28px 0 16px;
  padding-top: 16px;
  line-height: 26px;
  font-size: 20px;
}

.Readme h3 {
  margin: 16px 0 0;
  line-height: 26px;
  font-size: 18px;
}

.Readme h4 {
  margin: 14px 0 0;
  line-height: 22px;
  font-size: 16px;
}

.Readme p {
  line-height: 24px;
}

.Readme pre {
  font-size: 14px;
}
</style>

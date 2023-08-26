<script setup lang="ts">
import { useData } from 'vitepress';
import { useSlots } from 'vue';
import Icon from './Icon.vue';
import Page from './Page.vue';
import DownloadButton from './DownloadButton.vue';
import { Extension } from './data/extensions-loader.js';
import { formatDate } from './helpers/formatters.js';
import { GithubFilled } from '@ant-design/icons-vue';
const { params } = useData();
const ext: Extension = params.value as Extension;
const slots = useSlots();
const hasReadme = typeof slots.default?.()?.[0]?.type === 'string';
const dateString = new Date(ext.timestamp * 1000).toISOString();
console.log('dateString', dateString);
</script>

<template>
  <Page v-once>
    <div :class="$style.Breadcrumb">
      <!-- ← <a href="/extensions/">Back to Directory</a> -->
       <a href="/extensions/">← PopClip Extensions Directory</a>
    </div>

    <div :class="[$style.Main]">
      <!-- <div :class="$style.CardHeader">PopClip Extension</div> -->
      <h1>
        <Icon :class="$style.HeaderIcon" v-if="ext.iconUrlWhite && ext.iconUrlBlack" :srcLight="ext.iconUrlBlack"
          :srcDark="ext.iconUrlWhite" />
        {{ ext.name }}
      </h1>

      <div :class="$style.Container">
        <div :class="$style.Description" v-html="ext.description"></div>
        <div :class="$style.DownloadContainer">
          <DownloadButton size="small" :href="ext.downloadUrl" />
        </div>
      </div>
    </div>

    <div v-if="ext.demogif" :class="$style.Card">
      <div :class="$style.CardHeader">Demo</div>
      <img :class="$style.Demo" :src="ext.demogif" alt="Demo GIF" />
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
      <ul :class="$style.Data">        
        <li><span :class="$style.Label">First published</span><br><span>{{ formatDate(dateString) }}</span></li>
        <!-- <li><span :class="$style.Label">Maintainer</span><br><a href="https://github.com/pilotmoon">Nick Moore</a></li> -->
        <li><span :class="$style.Label">Identifier</span><br><code>{{ ext.identifier }}</code></li>
        <li><span :class="$style.Label">Source</span><br><GithubFilled /> <a :href="ext.repoUrl">pilotmoon/PopClip-Extensions/<span>{{ ext.handle }}</span>.popclipext/</a></li>
      </ul>
    </div>

    
  </Page>
</template>

<style module>

div.Breadcrumb {
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
}

div.Main {
  margin-bottom: 32px;
}

div.Card {
  margin: 16px 0 0;

  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 12px;
}


ul.Data {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: flex-start;
  gap: 6px 24px;
  
}
span.Label {
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.CardHeader {
  color: var(--vp-c-text-2);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

img.HeaderIcon {
  margin-right: 4px;
  opacity: 0.7;
}

.Container {
  display: flex;
  justify-content: space-between;
  align-items: bottom;
  gap: 16px;
  margin: 24px 0 0px;
}

.Description {
  font-size: 18px;
  line-height: 28px;
  font-weight: 400;
  margin: 0;

  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
}

.DownloadContainer {
  padding-top: 8px;

  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
}

@media (max-width: 550px) {
    .Container {
        flex-direction: column;
    }
    .DownloadContainer {
        display: flex;        
        justify-content: flex-end;
        padding: 0;
    }
}

img.Demo  {
  border-radius: 8px;
  display: inline-block;
}



/* Based on
https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/components/vp-doc.css */

div.Footer {
  margin-top: 32px;

  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;
}


div.Readme {
  background-color: var(--vp-c-bg);
  padding: 16px;
  border-radius: 8px;
}
.Readme h1 {
  margin: 12px 0 24px;
  line-height: 30px;
  font-size: 24px;
}

.Readme h2 {
  margin: 20px 0 16px;
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

.Readme p,
.Readme summary {
  margin: 16px 0;
}

.Readme p {
  line-height: 24px;
}

.Readme blockquote {
  margin: 16px 0;
  border-left: 2px solid var(--vp-c-divider);
  padding-left: 16px;
}

.Readme blockquote>p {
  margin: 0;
  font-size: 16px;
  color: var(--vp-c-text-2);
}

.Readme pre {
  font-size: 14px;
}

/**
 * Lists
 * -------------------------------------------------------------------------- */

.Readme ul,
.Readme ol {
  padding-left: 1.25rem;
  margin: 16px 0;
}

.Readme ul {
  list-style: disc;
}

.Readme ol {
  list-style: decimal;
}

/* .Readme li + li {
  margin-top: 8px;
}

.Readme li > ol,
.Readme li > ul {
  margin: 8px 0 0;
} */

/**
 * Table
 * -------------------------------------------------------------------------- */

.Readme table {
  display: block;
  border-collapse: collapse;
  margin: 20px 0;
  overflow-x: auto;
}

.Readme tr {
  border-top: 1px solid var(--vp-c-divider);
  transition: background-color 0.5s;
}

.Readme tr:nth-child(2n) {
  background-color: var(--vp-c-bg-soft);
}

.Readme th,
.Readme td {
  border: 1px solid var(--vp-c-divider);
  padding: 8px 16px;
}

.Readme th {
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
}

.Readme td {
  font-size: 14px;
}



/** Code */

.Card :not(pre, h1, h2, h3, h4, h5, h6)>code {
  font-size: var(--vp-code-font-size);
}

.Card :not(pre)>code {
  border-radius: 4px;
  padding: 3px 6px;
  color: var(--vp-c-text-code);
  background-color: var(--vp-c-mute);
}
</style>

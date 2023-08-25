<script setup lang="ts">
import { useData } from 'vitepress';
import Icon from './Icon.vue';
import Page from './Page.vue';
import DownloadButton from './DownloadButton.vue';
import { Extension } from './data/extensions-loader.js';
const { params } = useData();
const ext: Extension = params.value as Extension;
</script>

<template>
  <Page v-once>
    <div :class="$style.Breadcrumb">
      ← <a href="/extensions/">Back to Directory</a>
    </div>

    <h1>
      <Icon :class="$style.HeaderIcon" v-if="ext.iconUrlWhite && ext.iconUrlBlack" :srcLight="ext.iconUrlBlack"
        :srcDark="ext.iconUrlWhite" />
      {{ ext.name }}
    </h1>

    <div :class="$style.ButtonContainer">
      <DownloadButton :href="ext.downloadUrl"/>
    </div>
    
    <div :class="$style.Description">
      {{  ext.description }}
    </div>

    <div v-if="ext.demogif" :class="$style.Demo">
      <img :src="ext.demogif" alt="Demo GIF" />
    </div>



    <div class="box" :class="$style.Readme">      
      <slot />
    </div>
  </Page>
</template>

<style module>
div.Breadcrumb {
  margin-bottom: 1em;
}

img.HeaderIcon {
  margin-right: 4px;
  opacity: 0.7;
}

h1 {
  margin: 32px 0 24px;
}

.Description {
  font-size: 18px;
  line-height: 26px;
  font-weight: 400;
  margin: 16px 0;
}

.Demo img {
  width: 100%;
  border-radius: 8px;
}

.ButtonContainer {
  text-align: left;
  margin: 16px 0;
}

/* Based on
https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/components/vp-doc.css */

div.Readme {
  margin: 32px 0 0;
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

.Readme blockquote > p {
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

/**
 * Decorational elements
 * -------------------------------------------------------------------------- */

 .Readme hr {
  margin: 16px 0;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
}

/** Code */

.Readme :not(pre, h1, h2, h3, h4, h5, h6) > code {
  font-size: var(--vp-code-font-size);
}

.Readme :not(pre) > code {
  border-radius: 4px;
  padding: 3px 6px;
  color: var(--vp-c-text-code);
  background-color: var(--vp-c-mute);
}
</style>

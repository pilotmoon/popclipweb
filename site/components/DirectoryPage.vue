<script setup lang="ts">
import { useData } from 'vitepress';
import Icon from './Icon.vue';
import Page from './Page.vue';
import { Extension } from './data/extensions-loader.js';
const { params } = useData();
const ext: Extension = params.value as Extension;
</script>

<template>
  <Page>
    <div :class="$style.Breadcrumb">
      ← <a href="/extensions/">Back to Directory</a>
    </div>

    <h1>
      <Icon :class="$style.HeaderIcon" v-if="ext.iconUrlWhite && ext.iconUrlBlack" :srcLight="ext.iconUrlBlack"
        :srcDark="ext.iconUrlWhite" />
      {{ ext.name }}
    </h1>

    <p>Shortcode: {{ ext.shortcode }}</p>
    <div :class="$style.Readme" v-html="ext.readme" />
    <!-- <slot /> -->
    <!-- </div> -->
  </Page>
</template>

<style module>
div.Breadcrumb {
  margin-bottom: 1em;
}

img.HeaderIcon {
  margin-right: 4px;
}

div.Readme {
  /* background-color: var(--theme-color-bg); */
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
}

div.Readme h1 {
  font-size: 24px;

}
</style>

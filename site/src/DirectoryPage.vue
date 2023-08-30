<script setup lang="ts">
import { useData } from 'vitepress';
import { useSlots } from 'vue';
import Icon from './Icon.vue';
import Page from './Page.vue';
import DownloadButton from './DownloadButton.vue';
import { Extension } from './data/extensions-loader.js';
import { formatDate } from './helpers/formatters.js';
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

    <div :class="$style.Main">      
      <h1>
        <Icon v-if="ext.iconUrlWhite && ext.iconUrlBlack" :srcLight="ext.iconUrlBlack"
          :srcDark="ext.iconUrlWhite" />
        {{ ext.name }}
      </h1>

      <div :class="$style.SideBySide">
        <div :class="$style.Description" v-html="ext.description"></div>
        <div :class="$style.Download">
          <DownloadButton size="small" :href="ext.downloadUrl" />
        </div>
      </div>
    </div>

    <div v-if="ext.demogif" :class="$style.Card">
      <div :class="$style.CardHeader">Demo</div>
      <img :src="ext.demogif" alt="Demo GIF" />
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
        <li><span :class="$style.CardDataLabel">First published</span><br><span>{{ formatDate(dateString) }}</span></li>
        <!-- <li><span :class="$style.Label">Maintainer</span><br><a href="https://github.com/pilotmoon">Nick Moore</a></li> -->
        <li><span :class="$style.CardDataLabel">Identifier</span><br><code>{{ ext.identifier }}</code></li>
        <li><span :class="$style.CardDataLabel">Source</span><br><GithubFilled /> <a :href="ext.repoUrl">pilotmoon/PopClip-Extensions/<span>{{ ext.handle }}</span>.popclipext/</a></li>
      </ul>
    </div>

    
  </Page>
</template>

<style module>

.Breadcrumb {
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
}

.Main {
  margin-bottom: 32px;
}

.Main h1 img {
  margin-right: 4px;
  opacity: 0.7;
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

.Card > img  {
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

</style>

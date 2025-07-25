<script setup lang="ts">
import { useData } from "vitepress";
import { useSlots } from "vue";
import Icon from "./Icon.vue";
import type { ExtInfo, PartialExtInfo } from "./data/extensionInfo.js";
import { formatDate } from "./helpers/formatters.js";
import { ElPopover } from "element-plus";
import { ShieldTask16Filled } from "@vicons/fluent";

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
function extractSourceMessage(info: PartialExtInfo) {
  if (info.sourceMessage) return `Commit message: ${info.sourceMessage}`;
  return "";
}

const filteredPreviousVersions: PartialExtInfo[] = [];
let cursor: PartialExtInfo = ext;
for (const ver of ext.previousVersions) {
  // if less than 24 hours before the cursor version, skip
  if (!ver.sourceDate || !cursor.sourceDate) continue;
  if (ver.sourceDate.getTime() > cursor.sourceDate.getTime() - 24 * 60 * 60 * 1000) continue;
  cursor = ver;
  filteredPreviousVersions.push(ver);
}

function formatActionTypes(ext: ExtInfo) {
  if (!ext.actionTypes) return "";
  const lookup = {
    service: "Service",
    url: "Open URL",
    keypress: "Key Press",
    applescript: "AppleScript",
    shellscript: "Shell Script",
    javascript: "JavaScript",
    shortcut: "Shortcut",
    none: "None",
  };
  const strings: string[] = [];
  for (const type of ext.actionTypes) {
    let typeString = lookup[type];
    if (type === "javascript") {
      let entitlementsString = "";
      for (const entitlement of ext.entitlements) {
        if (entitlement === "network") {
          entitlementsString += "with internet access";
        }
      }
      if (entitlementsString) {
        typeString += ` (${entitlementsString})`;
      }
    }
    strings.push(typeString);
  }
  return strings.join(", ");
}
</script>

<template>
  <div :class="$style.Breadcrumb">
    <!-- ← <a href="/extensions/">Back to Directory</a> -->
    <a href="/extensions/">← PopClip Extensions Directory</a>
  </div>

  <div :class="$style.Main">
    <h1>
      <Icon v-if="ext.icon" :spec="ext.icon" :height="64" />
      {{ ext.name }}
    </h1>

    <div :class="$style.SideBySide">
      <div :class="$style.Description" v-html="ext.description"></div>
      <div :class="$style.Download">
        <DownloadButton size="small" :href="ext.download" />
        <ClientOnly>
          <ElPopover
            placement="bottom"
            title="Verified Extension"
            :width="200"
            trigger="hover"
            content="This extension has been vetted and approved by the developer of PopClip."
          >
            <template #reference>
              <div :class="$style.DownloadInfo"><ShieldTask16Filled /> Verified</div>
            </template>
          </ElPopover>
        </ClientOnly>
      </div>
    </div>

    <div v-if="ext.altStrings" :class="$style.AltStrings" style="color: var(--vp-c-text-2)">
      <span v-for="alt in ext.altStrings" :key="alt.lang">
        <span :class="$style.Subdued">{{ alt.lang }}</span>
        <b v-if="alt.name">{{ alt.name }}</b>
        <span v-if="alt.description">{{ alt.description }}</span>
      </span>
    </div>
  </div>

  <div v-if="ext.popclipVersionIsBeta" class="warning custom-block">
    <p class="custom-block-title">Needs PopClip Beta</p>
    <p>This extension requires {{ ext.popclipDisplayVersion }} of PopClip, available from <a href="/beta">PopClip Beta</a>.</p>
  </div>
  <div v-if="ext.unlisted" class="warning custom-block">
    <p class="custom-block-title">Unlisted Extension</p>
    <p>This extension is not shown in the directory index. It may be a pre-release or test extension.</p>
  </div>

  <div v-if="ext.demo" :class="$style.Card">
    <div :class="$style.CardHeader">Demo</div>
    <div :class="$style.Media">
      <img v-if="ext.demo.endsWith('.gif')" :src="ext.demo" alt="Demo Animated GIF" />
      <video v-if="ext.demo.endsWith('.mp4')" :src="ext.demo" alt="Demo Video" autoplay loop playsinline muted>Browser can't show this video.</video>
    </div>
  </div>

  <div v-if="hasReadme" :class="$style.Card">
    <div :class="$style.CardHeader">Readme</div>
    <div v-if="hasReadme" :class="$style.Readme">
      <slot />
    </div>
    <div v-else>The extension author did not provide a Readme file.</div>
  </div>

  <!-- <div v-if="ext.actionTypes.includes('javascript') && ext.owner=='github:17520'" :class="$style.Card">
    <div :class="$style.CardHeader">Say Thanks</div>

    <a href="https://buymeacoffee.com/pilotmoon"><img src="/bmac-button.png" width=200 /></a>
  </div> -->

  <div :class="$style.Card">
    <div :class="$style.CardHeader">Info</div>

    <ul :class="$style.CardData">
      <li v-if="ext.sourceDate">
        <span :class="$style.CardDataLabel">{{ ext.previousVersions.length ? "Updated" : "Created" }} </span><br /><span>{{
          formatDate(ext.sourceDate.toISOString())
        }}</span>
      </li>
      <li>
        <span :class="$style.CardDataLabel">Version</span><br /><span :title="extractSourceMessage(ext)">{{ ext.version }}</span>
      </li>
      <li>
        <span :class="$style.CardDataLabel">Identifier</span><br /><code>{{ ext.identifier }}</code>
      </li>
      <li v-if="ext.popclipDisplayVersion"><span :class="$style.CardDataLabel">PopClip Version</span><br />≥{{ ext.popclipDisplayVersion }}</li>
      <li v-if="ext.macosVersion"><span :class="$style.CardDataLabel">macOS Version</span><br />≥{{ ext.macosVersion }}</li>
      <li v-if="ext.actionTypes.length">
        <span :class="$style.CardDataLabel">Action Type</span><br />
        {{ formatActionTypes(ext) }}
      </li>
      <li v-if="ext.license">
        <span :class="$style.CardDataLabel">License</span><br /><a :href="ext.license.url">{{ ext.license.name }}</a>
      </li>
      <li>
        <span :class="$style.CardDataLabel">Source</span><br />
        <AaLink :href="ext.source" />
      </li>
    </ul>
  </div>

  <div v-if="ext.apps.length" :class="$style.Card">
    <div :class="$style.CardHeader">Works With</div>
    <ul :class="$style.CardList">
      <li v-for="app in ext.apps" :key="app.name">
        <span>{{ app.name }}:</span> <a :href="app.link">{{ app.link }}</a>
      </li>
    </ul>
    <span :class="$style.Small" style="margin-top: 4px"
      >Third-party product names and logos are used solely to identify compatible apps, websites, or services, and do not imply endorsement by the respective
      entities.
    </span>
  </div>

  <div v-if="filteredPreviousVersions.length" :class="$style.Card">
    <div :class="$style.CardHeader">Previous Versons</div>
    <ul :class="$style.CardData">
      <li v-for="ver in filteredPreviousVersions" :key="ver.version">
        <span :title="extractSourceMessage(ver)"
          >Version {{ ver.version }}
          <span :class="$style.small"
            >({{ formatDate(ver.sourceDate) }}<span v-if="ver.name !== ext.name">, as "{{ ver.name }}"</span>)</span
          >:</span
        >
        <a v-if="ver.source" :href="ver.source">Source</a>,
        <a v-if="ver.download" :href="ver.download">Download</a>
      </li>
    </ul>
  </div>
</template>

<style module>
.Small {
  font-size: 14px;
}
.Subdued {
  color: var(--vp-c-text-2);
}
a.Subdued {
  color: var(--vp-c-text-1);
}

.Breadcrumb {
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
}
.Breadcrumb a {
  text-decoration: none;
}

.Main {
  margin-bottom: 32px;
}
.Main a {
  text-decoration: none;
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

.Download {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.DownloadInfo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  line-height: 14px;
  gap: 2px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.DownloadInfo svg {
  margin-left: -3px;
  height: 18px;
  color: var(--vp-c-green-1);
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
.Card a {
  text-decoration: none;
}

.CardHeader {
  color: var(--vp-c-text-2);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

ul.CardList {
  list-style: none;
  padding-left: 0;
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

.Card > img {
  border-radius: 8px;
}

/* center items */
.Media {
  display: flex;
  flex-direction: row;
  justify-content: center;
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
.Readme a {
  text-decoration: underline;
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

<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";
import { ShieldTask16Filled } from "@vicons/fluent";
import { ElPopover } from "element-plus";
import type { AuthorInfo } from "./data/authorInfo.js";
import type { ExtInfo } from "./data/extensionInfo.js";
import { data as exts } from "./data/extensions.data";
import DirectoryEntry from "./DirectoryEntry.vue";

const { params } = useData();
const author = params.value as unknown as AuthorInfo;

// this author's extensions, newest first. unlisted ones are included:
// this page is where an author's work lives, whether or not it has been
// added to the directory index.
const extensions = computed<ExtInfo[]>(() =>
  (exts as ExtInfo[])
    .filter((ext) => ext.owner === `github:${author.githubId}`)
    .map((ext) => ({
      ...ext,
      firstCreated: new Date(ext.firstCreated),
      created: new Date(ext.created),
    }))
    .sort((a, b) => b.firstCreated.getTime() - a.firstCreated.getTime()),
);

const displayName = computed(() => author.name || author.githubHandle);
</script>

<template>
  <div :class="$style.Breadcrumb">
    <a href="/extensions/">← PopClip Extensions Directory</a>
  </div>

  <div :class="$style.Main">
    <div :class="$style.Header">
      <img
        :class="$style.Avatar"
        :src="author.avatarUrl"
        :alt="displayName"
        width="72"
        height="72"
        loading="lazy"
      />
      <div :class="$style.Identity">
        <h1 :class="$style.Name">{{ displayName }}</h1>
        <div :class="$style.Meta">
          <!-- AaLink renders github urls with the github mark -->
          <AaLink :href="author.githubUrl" />
          <a v-if="author.websiteUrl" :href="author.websiteUrl">{{
            author.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
          }}</a>
          <!-- "identity", not just "verified": the extension pages use
               "Source Verified" for provenance, and one word meaning two
               different things across the site helps nobody. the note
               keeps it to the fact, so it doesn't read as an endorsement
               of the person's work -->
          <ClientOnly v-if="author.verified">
            <ElPopover
              placement="bottom"
              title="Identity Verified"
              :width="280"
              trigger="hover"
              content="This author page has been confirmed as belonging to the person named."
            >
              <template #reference>
                <span :class="$style.Verified">
                  <ShieldTask16Filled /> Identity Verified
                </span>
              </template>
            </ElPopover>
          </ClientOnly>
        </div>
        <p v-if="author.bio" :class="$style.Bio">{{ author.bio }}</p>
      </div>
    </div>
  </div>

  <div :class="$style.Card">
    <div :class="$style.CardHeader">
      {{ extensions.length }}
      {{ extensions.length === 1 ? "Extension" : "Extensions" }}
    </div>
    <!-- no bylines: every entry here shares this page's author -->
    <DirectoryEntry
      v-for="ext in extensions"
      :key="ext.id"
      :ext="ext"
      :byline="false"
    />
    <p v-if="!extensions.length" :class="$style.Empty">
      Nothing published here yet.
    </p>
  </div>
</template>

<style module>
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

.Header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.Avatar {
  border-radius: 50%;
  flex-shrink: 0;
}

.Identity {
  min-width: 0;
}

.Name {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
}

.Meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  font-size: 14px;
  margin-top: 6px;
}
.Meta a {
  text-decoration: none;
}
.Meta a:hover {
  text-decoration: underline;
}

.Verified {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--vp-c-text-2);
}
.Verified svg {
  width: 14px;
  height: 14px;
}

.Bio {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
}

.Card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.Empty {
  margin: 0;
  color: var(--vp-c-text-2);
}

.CardHeader {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  margin-bottom: 12px;
}
</style>

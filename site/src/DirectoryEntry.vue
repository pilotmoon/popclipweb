<script setup lang="ts">
import Icon from "./Icon.vue";
import type { ExtInfo } from "./data/extensions.data";
import { downloadUrl } from "./helpers/directoryHelpers.js";
const props = defineProps<{
  ext: ExtInfo;
}>();
</script>

<template>
    <div :class=$style.DirectoryEntry v-once>
        <div :class=$style.EntryDownload>
            <DownloadButton theme="bare" size="smaller" :href=downloadUrl(props.ext) icon-only />
        </div>
        <div :class=$style.EntryIcon>
            <a :href="'x/' + props.ext.shortcode">
                <Icon v-if=props.ext.icon :spec=props.ext.icon :height=64 />
            </a>
        </div>
        <div :class=$style.EntryMain>
            <a :class=$style.EntryName :href="'x/' + props.ext.shortcode">
                <div :class=$style.EntryName>{{ props.ext.name }}</div>
            </a>
            <div :class=$style.EntryDescription v-html=props.ext.description />
        </div>
    </div>
</template>

<style module>
.DirectoryEntry {
    display: flex;
    align-items: center;

    gap: 12px;
    margin-bottom: 8px;    
}

.EntryDownload {
    display: flex;
    align-items: center;
}

.EntryIcon {
    display: flex;
    align-items: center;    

    font-size: 20px;
    width: 24px;    
    opacity: 0.7;
}

.EntryIcon img {
    width: 24px;
}

.EntryMain {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
    min-width: 0;
    /* Somehow this makes the truncation on the child element work */

    display: flex;
    gap: 12px;
    align-items: baseline;
    justify-content: start;
}

.EntryMain a {
    text-decoration: none;
}

.EntryMain a:hover {
    text-decoration: underline;
}

.EntryName {
    font-weight: 600;
    font-size: 16px;

    flex-shrink: 0;
    flex-basis: auto;
}

.EntryDescription {
    font-size: 14px;

    /* Truncate text with ellipsis */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    flex-shrink: 1;
    flex-basis: auto;
}

@media (max-width: 550px) {
    .EntryDownload {
        display: none;
    }
}
</style>./data/extensions.data

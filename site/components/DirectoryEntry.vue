<script setup lang="ts">
import Icon from './Icon.vue';
import DownloadButton from './DownloadButton.vue';
import { Extension } from './data/extensions-loader.js';
defineProps<{
    ext: Extension
}>();
</script>

<template>
    <div :class="$style.DirectoryEntry">
        <div :class="$style.EntryLeft">
            <a :href="'x/' + ext.shortcode">
                <Icon v-if="ext.iconUrlWhite && ext.iconUrlBlack" :srcDark="ext.iconUrlWhite"
                    :srcLight="ext.iconUrlBlack" />
            </a>
        </div>
        <div :class="$style.EntryMain">
            <div :class="$style.EntryHeader">
                <a :href="'x/' + ext.shortcode">
                    <span :class="$style.EntryName">{{ ext.name }}</span>
                </a>
            </div>
            <div v-html="ext.description" :class="$style.EntryDescription"></div>
        </div>
        <div :class="$style.EntryRight">
            <DownloadButton theme="outline" size="smaller" :href="ext.downloadUrl" icon-only />
        </div>
    </div>
</template>

<style module>
.DirectoryEntry {
    display: flex;
    gap: 12px;
    background-color: var(--vp-c-bg-soft);
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 8px;
    position: relative;
}

.EntryMain {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
    min-width: 0; /* Somehow this makes the truncation on the child element work */
}

.EntryLeft,
.EntryRight {
    display: flex;
    align-items: center;
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: auto;
}

.EntryLeft {
    width: 30px;
    font-size: 24px;
    opacity: 0.6;
}

.EntryName {
    font-weight: 600;
    font-size: 16px;
}

.EntryDescription {
    font-size: 14px;
    
    /* Truncate text with ellipsis */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 550px) {
    .EntryRight {
        display: none;
    }
}
</style>

<script setup lang="ts">
import Icon from './Icon.vue';
import { Extension } from './data/extensions-loader.js';
const props = defineProps<{
    ext: Extension
}>();
</script>

<template>
    <div :class="$style.DirectoryEntry" v-once>
        <div :class="$style.EntryLeft">
            <a :href="'x/' + props.ext.shortcode">
                <Icon v-if="props.ext.iconUrlWhite && props.ext.iconUrlBlack" :srcDark="props.ext.iconUrlWhite"
                    :srcLight="props.ext.iconUrlBlack" />
            </a>
        </div>
        <div :class="$style.EntryMain">
            <div :class="$style.EntryHeader">
                <a :href="'x/' + props.ext.shortcode">
                    <div :class="$style.EntryName">{{ props.ext.name }}</div>
                </a>
                <div v-html="props.ext.description" :class="$style.EntryDescription" />
            </div>        
        </div>
        <div :class="$style.EntryRight">
            <DownloadButton theme="outline" size="smaller" :href="props.ext.downloadUrl" icon-only />
        </div>
    </div>
</template>

<style module>
.DirectoryEntry {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    position: relative;
}

.EntryMain {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
    min-width: 0; /* Somehow this makes the truncation on the child element work */
}

.EntryHeader {
    display: flex;
    gap: 12px;
    flex-direction: row;
    align-items: baseline;
    justify-content: start;
}

.EntryHeader a {
    text-decoration: none;
}
.EntryHeader a:hover {
    text-decoration: underline;
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
    width: 24px;
    font-size: 20px;
    opacity: 0.6;
}

.EntryHeader > a {
    flex-shrink: 0;
    flex-basis: auto;
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

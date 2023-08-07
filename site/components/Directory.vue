<script setup lang="ts">
import { data } from './data/extensions.data';
import Button from './Button.vue';
import Icon from './Icon.vue';
</script>

<template>
    <div :class="$style.Directory">
        <div v-for="(extension, index) in data.extensions" :key="extension.handle" :class="$style.DirectoryEntry">
            <div :class="$style.EntryLeft" >  
                <Icon v-if="extension.imageDark && extension.imageLight" :srcDark="extension.imageDark" :srcLight="extension.imageLight" />&ensp;
            </div>
            <div :class="$style.EntryMain">                           
                <div :class="$style.EntryHeader">
                    <a :href="'x/' + extension.hash">
                        <span :class="$style.EntryName">{{ extension.title }}</span>
                    </a>
                </div>                
                <div v-html="extension.description"></div>
            </div>
            <div :class="$style.EntryRight">
                <Button v-if="extension.download" :class="$style.DownloadButton" size=small theme="alt" text="Download" :href="extension.download" />
            </div>
        </div>
    </div>
</template>

<style module>

.Directory {
    margin-top: 32px; 
    width: 100%;
}
.DirectoryEntry {
    display: flex;
    gap: 12px;
    background-color: var(--vp-c-bg-soft);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    position: relative;
}

.EntryMain {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
}

.EntryLeft, .EntryRight {
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: auto;    
}

.EntryLeft {
    width: 30px;
    font-size: 24px;
    opacity: 0.7;
}

.EntryHeader {
    
}
.EntryTitle a, .EntryTitle a:hover {
    text-decoration: none;
}

.EntryName {
    font-weight: 600;
    font-size: 1.1em;
}

</style>

<script setup lang="ts">
import { data } from './data/extensions.data';
import Button from './Button.vue';
import Icon from './Icon.vue';
</script>

<template>
<div :class="$style.Directory">
    <h1>PopClip Extensions Directory</h1>
    <div v-for="(extension, index) in data.extensions" :key="extension.handle" :class="$style.changelogEntry">        
        <h2><Icon v-if="extension.imageDark && extension.imageLight" :srcDark="extension.imageDark" :srcLight="extension.imageLight" /> {{ extension.title }}</h2>
        <div v-if="extension.download" style="float: right; margin-left: 16px">
            <Button size=small theme="brand" text="Download" :href="extension.download" />
        </div>
        <a :href="'x/' + extension.hash">Link</a>
        <div v-html="extension.description"></div>
        <div>{{extension.image}}</div>
        <!-- <div v-html="extension.hash"></div> -->

    </div>
</div>
</template>

<style module>
/* .Directory {
    padding: 32px 24px 96px;
    width: 100%;
} */
</style>

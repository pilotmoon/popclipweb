<script setup lang="ts">
import { data } from './data/extensions.data';
import Button from './Button.vue';

</script>

<template>
<div :class="$style.Directory">
    <h1>PopClip Extensions Directory</h1>
    <div v-for="(extension, index) in data.extensions" :key="extension.handle" :class="$style.changelogEntry">
        <h2>{{ extension.title }}</h2>
        <div v-html="extension.description"></div>
        <div v-html="extension.hash"></div>
        <div v-if="extension.download">
            <Button size=small theme="brand" text="Download" :href="extension.download" />
        </div>
    </div>
</div>
</template>

<style module>
/* .Directory {
    padding: 32px 24px 96px;
    width: 100%;
} */
</style>

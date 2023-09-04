<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { formatDate, formatSize, formatArchs } from './helpers/formatters';
import { useSessionStorage } from '@vueuse/core';
const downloaded = useSessionStorage("popclip-downloaded", {});
const props = defineProps<{
    name: string,
    ver: string,
    date: string
    notes: string
    os: string
    url: string
    channel: "production" | "beta"
    size: number,
    archs: string[]
}>();
const auto = ref(false);
onMounted(() => {
    if (window.location.hash === "#go" && props.url) {
        console.log("hasDownloaded", downloaded.value[props.url]);
        if (downloaded.value[props.url]) {
            console.log("already downloaded", props.url);
        } else {
            downloaded.value[props.url] = true;
            console.log("auto download", props.url);
            window.location.href = props.url;
            auto.value = true;
        }            
    }
});

</script>

<template>
    <div :class="$style.downloadBox">
        <div><span :class="$style.promote">
                {{ props.name }} {{ props.ver }}</span><span v-if="channel !== 'production'" :class="$style.splash">&ensp;
                {{ channel }}</span>&ensp;{{ formatDate(props.date) }}&ensp;
            <a :href="props.notes">Release notes</a>
        </div>
        <div style="margin: 6px 0 0 0">Requires macOS {{ props.os }} or above. {{ formatArchs(props.archs) }}.</div>
        <div style="margin: 8px 0 0 0">
            <DownloadButton :href="props.url" size="small"/>&ensp;
            Zip file, {{ formatSize(props.size) }}
        </div>
        <div style="margin: 8px 0 0 0" v-if="auto" :class="$style.status">Your download has started automatically.</div>
    </div>
</template>

<style module>
div.downloadBox {
    background-color: var(--vp-c-bg-soft);
    border-radius: 8px;
    padding: 16px;
}

span.promote {
    font-size: 1.2em;
    font-weight: 600;
}

span.diminish {
    font-size: 0.9em;
}

span.splash {
    color: var(--vp-c-text-2);
    text-transform: uppercase;
    font-size: 0.9em;
    font-weight: 500;
}
div.status {
    color: var(--vp-c-text-2);
}
</style>
<script setup lang="ts">
import DownloadButton from './DownloadButton.vue'
import { formatDate, formatSize, formatArchs } from './helpers/formatters';
import { DownloadOutlined } from '@ant-design/icons-vue';
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
</style>
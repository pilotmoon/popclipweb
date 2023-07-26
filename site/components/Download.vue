<script setup lang="ts">
import Button from './Button.vue';
import { computed } from 'vue'
import { formatDate, formatSize, formatArchs } from './helpers/formatters';
const props = defineProps<{
  name: string,
  ver: string,
  date: string
  notes: string
  os: string
  type: "production" | "beta"
  size: number,
  archs: string[]
}>();

const theme = computed(() => props.type === "production" ? "brand" : "alt");

</script>

<template>
    <div :class="$style.downloadBox">
        <div><span :class="$style.promote">{{ props.name }} {{ props.ver }}</span> &ensp;{{ formatDate(props.date) }}&ensp;
            <a :href="props.notes">Release notes</a>
        </div>
        <div>Requires macOS {{ props.os }}  or above. {{ formatArchs(props.archs) }}</div>
        <div style="margin: 8px 0 0 0"><Button size=small :theme="theme" text="Download" />&ensp;Zip file, {{ formatSize(props.size) }}</div>
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
</style>
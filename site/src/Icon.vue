<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import config from './config/config.json'
import { querifyDescriptor } from './helpers/iconDescriptor.js'
import { useData } from 'vitepress'

const cacheKey = "a";
const { isDark } = useData();
const props = defineProps<{
    spec: string
    height?: number
}>()

const src = ref(iconUrl(false));

function setSrc() {
    src.value = iconUrl(isDark.value);
}

onMounted(setSrc);
watch(isDark, setSrc);
watch(props, setSrc)

function iconUrl(dark: boolean) {
    const query = querifyDescriptor({
        specifier: props.spec,
        color: dark ? "#ffffff" : "#000000",
        height: typeof props.height === 'number' && props.height > 0 ? props.height * 2 : 256
    }, cacheKey);
    return config.pilotmoon.iconsRoot + "/icon?" + query;
};

</script>

<template>
    <img :src="src">
</template>

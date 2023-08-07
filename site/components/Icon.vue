<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import * as config from '../config.json'

const { isDark } = useData()

const props = defineProps<{
    srcLight?: string
    srcDark?: string
}>()

const src = computed(() => {
    const url = (isDark.value ? props.srcDark : props.srcLight) || "";
    if (typeof url === 'string' && window?.location?.hostname === 'localhost') {
        console.log("oioioioio");
        return url.replace(/^\/content/, config.pilotmoon.cdnRoot);
    }
    return url;
})
</script>

<template>
    <img :src="src" class="Icon" />
</template>

<style scoped>
.Icon {
    width: 1.2em;
    display: inline-block;
    margin-bottom: -0.2em
        /* margin: 0 0.2em -0.35em 0.2em; */
        /*background-color: #f6f6f6;*/
        /* background-color: red;
    padding: 0.3em;
    border-radius: 0.2em; */
}
</style>

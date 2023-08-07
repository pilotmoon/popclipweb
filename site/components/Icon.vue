<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import * as config from '../config.json'

const { isDark } = useData()

const props = defineProps<{
    spec: string
}>()

const src = computed(() => {
    const apiRoot = window.location.hostname === "localhost" ? "http://localhost:1235" : "/api";
    const result = apiRoot +  '/frontend/icon/' + encodeURIComponent(props.spec) + '?color=' + (isDark.value ? 'white' : 'black');
    console.log("Icon src:", result);
    return result;
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

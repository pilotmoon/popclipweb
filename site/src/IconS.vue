<script setup lang="ts">
import { computed, ref, onMounted, watch, reactive } from 'vue'
import config from './config/config.json'
import { calculateIconKey, querifyDescriptor } from './helpers/icon.js'
import axios from 'axios';
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, string>({
    max: 100,
});

// const apiRoot = "http://localhost:1235";
const apiRoot = config.pilotmoon.apiRoot;
const iconCdnPath = config.pilotmoon.cdnRoot + "/icon/id-test-b";

const props = defineProps<{
    spec: string
}>()

const specifier = ref(props.spec);
watch(() => props.spec, (spec, prevSpec) => {
    console.log("spec changed", spec, prevSpec);
    specifier.value = spec;
})

const descriptor = computed(() => {
    return {
        specifier: specifier.value,
        flipHorizontal: true,
        // scale: 10.1,
        color: '#ff0000'
    }
})

const key = computed(() => calculateIconKey(descriptor.value));
const iconUrl = computed(() => `${iconCdnPath}/${key.value}`);
const src = ref(iconUrl.value);

watch(iconUrl, async (url, prevUrl) => {
    console.log("iconUrl changed", url, prevUrl);
    src.value = "/spinner.svg";
    try {
        src.value = await imgLoadServer();
    } catch {
        await onError(null);
    }
})

async function onError(event) {
    console.log("onError", event);
    src.value = "/err.png";
}

// async function imgLoadCdn() {
//     console.log("imgLoadCdn");
//     try {
//         // const responseHead = await axios.head(iconUrl.value);
//         // console.log("head response", responseHead.headers)

//         // check cached url
//         let url = iconUrl.value;
//         const cachedUrl = cache.get(iconUrl.value);
//         if (cachedUrl) {
//             console.log("cachedUrl", cachedUrl);
//             url = cachedUrl;
//         } else {
//             url = iconUrl.value + "?cachebust=" + Math.random().toString(36).substring(7);
//         }

//         const response = await axios.get(url, { responseType: 'arraybuffer' });
//         cache.set(iconUrl.value, url);

//         // construct data URL from response data
//         // console.log(typeof response.data);
//         // const buf: ArrayBuffer = response.data;
//         // const contentType = response.headers['content-type'];
//         // const base64String = btoa(String.fromCharCode(...new Uint8Array(buf)));
//         // const dataUrl = `data:${contentType};base64,${base64String}`
//         // console.log("dataUrl", dataUrl);
//         // return dataUrl;
//         return url;
//     }
//     catch {
//         console.log("imgLoadCdn failed")
//         return await imgLoadServer();
//         // nothing
//     }
// }

function makeDataUrl(buf: ArrayBuffer, contentType: string) {
    const base64String = btoa(String.fromCharCode(...new Uint8Array(buf)));
    const dataUrl = `data:${contentType};base64,${base64String}`
    return dataUrl;
}

async function imgLoadServer() {
    const response = await axios.get(apiRoot + "/frontend/icon", { params: querifyDescriptor(descriptor.value), responseType: 'arraybuffer' });
    return makeDataUrl(response.data, response.headers['content-type']);
}

</script>

<template>
    <img :src="src" class="Icon" @error="onError">
</template>

<style scoped>
.Icon {
    height: 64px;
}
</style>

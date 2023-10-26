<script setup lang="ts">
import { computed, ref, onMounted, watch, reactive } from 'vue'
import config from './config/config.json'
import { querifyDescriptor } from './helpers/iconDescriptor.js'
import { useDeploymentInfo } from './composables/useDeploymentInfo.js'
import axios from 'axios';
import { useData } from 'vitepress'

const { isDark } = useData()

const apiRoot = useDeploymentInfo().isLocalhost ? config.pilotmoon.iconsRoot : useDeploymentInfo().origin + "/api";

const props = defineProps<{
    spec: string
}>()

const specifier = ref(props.spec);
watch(() => props.spec, (spec, prevSpec) => {
    console.log("spec changed to", spec);
    specifier.value = spec;
})

const descriptor = computed(() => {
    return {
        specifier: specifier.value,
        color: isDark.value ? "#ffffff" : "#000000",
    }
})

const iconUrl = computed(() => {
    return apiRoot + "/icon?" + querifyDescriptor(descriptor.value, "2021-10-26-C");
});

const src = ref(iconUrl.value);

watch(iconUrl, async (url, prevUrl) => {
    console.log("iconUrl changed to", url);
    src.value = url;
    // try {
    //     src.value = await imgLoad();
    // } catch {
    //     await onError(null);
    // }
})

async function onError(event) {
    console.log("onError", event);
    src.value = "/err.png";
}

async function imgLoad() {
    const response = await axios.get(iconUrl.value, {
        responseType: "arraybuffer",
    });
    return response.request.responseURL;
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

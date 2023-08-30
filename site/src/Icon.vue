<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useData } from 'vitepress'
import * as config from './config/config.json'

const { isDark } = useData()

const props = defineProps<{
    srcLight?: string
    srcDark?: string
}>()

const src = ref(props.srcLight);

function setSrc() {
    src.value = isDark.value ? props.srcDark : props.srcLight;
}

watch(isDark, () => {
    setSrc()
})

onMounted(() => {
    setSrc()
})

// had to do this because computed() was not having effect at page load somehow
// computed(() => {
//     return isDark.value ? props.srcDark : props.srcLight;
// })

</script>

<template>
    <img :src="src" class="Icon" />
</template>

<style scoped>
.Icon {
    width: 1.2em;
    display: inline-block;
    margin-bottom: -0.2em
}
</style>

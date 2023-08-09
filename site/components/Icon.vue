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
    return isDark.value ? props.srcDark : props.srcLight;
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
}
</style>

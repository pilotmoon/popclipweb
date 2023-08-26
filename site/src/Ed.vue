<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalState } from './helpers/state'
const { edition } = useGlobalState();
const props = defineProps({
    code: {
        type: Boolean,
    },
    base: {
        type: String,
        default: "Standalone and Mac App Store editions",
    },
    setapp: {
        type: String,
        default: "Setapp edition",
    },
});
const element=computed(() => props.code ? "code" : "span");
</script>

<template>
    <component :is="element" v-if="edition === 'setapp'" v-html="setapp" />    
    <component :is="element" v-else v-html="base" />
</template>

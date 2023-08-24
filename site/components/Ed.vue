<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalState } from './state/state'
const { edition } = useGlobalState();
const props = defineProps({
    code: {
        type: Boolean,
    },
    base: {
        type: String,
    },
    setapp: {
        type: String,
    },
});
const element=computed(() => props.code ? "code" : "span");
</script>

<template>
    <component :is="element" v-if="edition === 'setapp'" v-html="setapp" />    
    <component :is="element" v-else v-html="base" />
</template>

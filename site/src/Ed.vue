<script setup lang="ts">
import { computed } from 'vue';
import { useEditionSwitcherState } from './state/useEditionSwitcherState'
const { edition } = useEditionSwitcherState();
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
</script>

<template>
    <!---- Didn't use <component> here because it wasn't rendeting v-html in SSR -->
    <span v-if="code">
        <code v-if="edition === 'setapp'" v-html="props.setapp" />    
        <code v-else v-html="props.base" />
    </span>
    <span v-else>
        <span v-if="edition === 'setapp'" v-html="props.setapp" />    
        <span v-else v-html="props.base" />
    </span>
</template>

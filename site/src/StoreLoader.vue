<script setup type="ts">
import { onMounted } from 'vue'
import { loadStore } from './composables/useStoreState'

onMounted(() => {
    loadStore();
});

</script>

<template>
    <div id="store-loader" />
</template>


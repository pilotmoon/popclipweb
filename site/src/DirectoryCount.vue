<script setup lang="ts">
import { data } from '../src/data/extensions.data';
</script>

<template>
    <span>{{ Object.keys(data.extensions).length }}</span>
</template>
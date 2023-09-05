<script setup>
import { onMounted } from 'vue'
import { loadScript } from './helpers/loadScript'
import config from './config/config.json'

onMounted(() => {
    // loadScript(config.setapp.script);
    loadScript('/setapp-banner.js');
});
</script>

<template>
  <setapp-custom-banner iconUrl="/icon512.png" appName="PopClip" appId="159" vendorId="92"></setapp-custom-banner>
</template>
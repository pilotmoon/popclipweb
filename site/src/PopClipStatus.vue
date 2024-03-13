<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';
const ver=ref(undefined);
onMounted(async () => {
    // connect to localhost:<port>/health
    let port = 58906;
    while (port < 58916) {
        try {
            const response = await fetch(`http://localhost:${port}/health`);
            const data = await response.json();
            if (data?.application === "com.pilotmoon.popclip" || data?.application === "com.pilotmoon.popclip-setapp") {
                console.log("PopClip found on port", port, data);
                ver.value=data.versionNumber;
                break;
            }
        } catch (e) {
            console.log("PopClip not found on port", port);
            port++;
        }
    }    
})
</script>

<template>
    <p>Hello {{ ver }}</p>
</template>

<style module>

</style>
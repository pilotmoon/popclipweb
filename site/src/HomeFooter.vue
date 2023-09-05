<script setup>
import Setapp from './Setapp.vue'
</script>
<template>
    <div class="container">
        <div class="HomeFooter">
            <Setapp />
        </div>
    </div>
</template>

<style scoped>
.HomeFooter {
    position: relative;
    padding: 0 24px;
}

@media (min-width: 640px) {
    .HomeFooter {
        padding: 0 48px;
    }
}

@media (min-width: 960px) {
    .HomeFooter {
        padding: 0 64px;
    }
}

.container {
    margin: 24px auto 0;
    max-width: 1276px;
}
</style>
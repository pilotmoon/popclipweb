<script setup lang="ts">
import { ElInput } from 'element-plus'
import Icon from './Icon.vue'
import { ref } from 'vue';

const spec = ref("A")
</script>

<template>
    <div class="icon-explorer">
        <span>Try it out! Type an icon specifier in the box to see the icon it produces.</span>
        <ElInput v-model="spec" placeholder="Type icon specifier" />
        <div class="icon-preview">
            <Icon :spec="spec" />
        </div>
    </div>
</template>

<style scoprd>
.icon-explorer {
    background-color: var(--vp-c-bg-soft);
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;

    display: flex;
    flex-direction: column;
    gap: 16px;
}
.icon-preview {
    display: flex;
    justify-content: center;
}
.icon {
    height: 64px;
}
</style>
<script setup lang="ts">
// ConfigProvider for Ant Design Vue
// Sets the theme based on the isDark value from VitePress

import { ConfigProvider, StyleProvider, theme } from 'ant-design-vue';
import { computed } from 'vue';
import { useData } from 'vitepress';

const { isDark } = useData();
const antTheme = computed(() => {
    // console.log("isDark", isDark.value);
    return isDark.value ? {
        algorithm: theme.darkAlgorithm,
        token: {
            colorPrimary: 'rgb(63, 162, 243)', // same as var(--vp-c-brand-1) in .dark
        }
    } : {
        algorithm: theme.defaultAlgorithm,
        token: {
            colorPrimary: 'rgb(66, 123, 233)', // same as var(--vp-c-brand-1) in :root
        }
    }
});
</script>

<template>
    <ConfigProvider :theme="antTheme">
        <!-- <StyleProvider hash-priority="high"> -->
            <slot />
        <!-- </StyleProvider> -->
    </ConfigProvider>
</template>
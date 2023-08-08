<script setup lang="ts">
// ConfigProvider for Ant Design Vue
// Sets the theme based on the isDark value from VitePress

import { ConfigProvider, StyleProvider, theme } from 'ant-design-vue';
import { computed } from 'vue';
import { useData } from 'vitepress';

const { isDark } = useData();
const antTheme = computed(() => {
    console.log("isDark", isDark.value);
    return {
      algorithm: isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }
});
</script>

<template>
    <ConfigProvider :theme="antTheme">
        <StyleProvider hash-priority="high">
        <slot />
        </StyleProvider>
    </ConfigProvider>
</template>
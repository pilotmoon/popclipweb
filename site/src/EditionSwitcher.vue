<script setup lang="ts">
import Theme from './Theme.vue';
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/switch/style/css'
import './style/overrides.css'
import { ElSwitch, ElSpace } from 'element-plus'
import { useEditionSwitcherState } from './state/useEditionSwitcherState'
import { computed } from 'vue';

const { edition } = useEditionSwitcherState();
const state = computed({
    get() {
        return edition.value === 'setapp';
    },
    set(newValue) {
        edition.value = newValue ? 'setapp' : 'base';
    }
});
</script>

<template>
    <div :class="$style.EditionSwitcher">
        View docs for PopClip edition:
        <ElSwitch v-model="state" inactive-text="Standalone or Mac App Store" active-text="Setapp"
            inactive-color="var(--el-color-primary)" active-color="var(--el-color-primary)" />

    </div>
</template>

<style module>
.EditionSwitcher {
    background-color: var(--vp-c-bg-soft);
    border-radius: 8px;
    padding: 16px;
    font-size: 14px;
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 0 12px;
    flex-wrap: wrap;
}
</style>
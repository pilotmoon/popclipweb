<script setup lang="ts">
import Theme from './Theme.vue';
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/switch/style/css'
import './style/overrides.css'
import { ElSwitch } from 'element-plus'
import { useEditionSwitcherState } from './state/useEditionSwitcherState'
import { WatchStopHandle, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const { edition } = useEditionSwitcherState();
const state = ref(false);
const updateSwitch = (newEditionString) => {
    state.value = newEditionString === 'setapp';
}
const stoppers: WatchStopHandle[] = [];
onMounted(() => {
    console.log('mounted edition', edition.value);
    stoppers.push(watch(edition, updateSwitch));
    stoppers.push( watch(state, (newVal) => {
        edition.value = newVal ? 'setapp' : 'base';
    }));
    updateSwitch(edition.value);
});
onBeforeUnmount(() => {
    console.log('stopping watchers');
    stoppers.forEach((stop) => stop());
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
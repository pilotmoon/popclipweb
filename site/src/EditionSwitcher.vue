<script setup lang="ts">
import Theme from './Theme.vue';
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/es/components/radio-button/style/css'
import 'element-plus/es/components/radio-group/style/css'
import 'element-plus/es/components/space/style/css'
import './style/overrides.css'
import { ElSpace, ElRadioGroup, ElRadioButton } from 'element-plus'

import { useEditionSwitcherState } from './state/useEditionSwitcherState'
const { edition } = useEditionSwitcherState();
</script>

<template>
    <div :class="$style.EditionSwitcher">
        Use the selector below to choose the <a href="/guide/install#obtaining-popclip">PopClip edition</a> you would
        like to see documentation for.
        <ElSpace size="default">
            Edition:
            <ElRadioGroup v-model="edition" name="editionSwitcher">
                <ElRadioButton label="base">Standalone and Mac App Store editions</ElRadioButton>
                <ElRadioButton label="setapp">Setapp edition</ElRadioButton>
            </ElRadioGroup>
        </ElSpace>
    </div>
</template>

<style module>
.EditionSwitcher {
    font-size: 14px;
    display: flex;
    justify-content: start;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
    background-color: var(--vp-c-bg-soft);
    border-radius: 8px;
    padding: 16px;
}
</style>
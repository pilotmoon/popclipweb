<script setup lang="ts">
import Theme from './Theme.vue';
import { RadioButton, RadioGroup, Space } from 'ant-design-vue';
import { useGlobalState } from './helpers/state'
const { edition } = useGlobalState();
</script>

<template>
    <Theme>
    <div :class="$style.EditionSwitcher">
        Use the selector below to choose the <a href="/guide/install#obtaining-popclip">PopClip edition</a> you would like to see documentation for.
        <Space>
            Edition:
            <RadioGroup v-model:value="edition" name="editionSwitcher">
                <RadioButton value="base">Standalone and Mac App Store editions</RadioButton>
                <RadioButton value="setapp">Setapp edition</RadioButton>
            </RadioGroup>
        </Space>
    </div>
</Theme>
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
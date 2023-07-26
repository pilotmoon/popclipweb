<script setup lang="ts">
import * as config from '../config.json';
import { computed, onMounted } from 'vue';
import { store, loadStore } from './store/store';

const props = defineProps<{
    k: string
}>()

console.log('config', config);
console.log('props.key', props.k);

const href = computed(() => {
    // special case for mas.storeUrl, so it points to correct country
    if (props.k === 'mas.storeUrl') {
        return store.masUrl;
    }

    console.log('props.key', props.k);
    const keyPath = props.k.split('.');
    let value = config;
    for (const key of keyPath) {
        value = value[key];
    }
    return typeof value === 'string' ? value : '';
});

onMounted(() => {
    loadStore();
});

</script>

<template>
    <a :href="href">
        <slot></slot>
    </a>
</template>

<style scoped>
.Button {
    display: inline-block;
    border: 1px solid transparent;
    text-align: center;
    font-weight: 600;
    white-space: nowrap;
}

.Button:hover {
    text-decoration: none;
}

.Button.medium {
    border-radius: 20px;
    padding: 0 20px;
    line-height: 38px;
    font-size: 14px;
}

.Button.big {
    border-radius: 24px;
    padding: 0 24px;
    line-height: 46px;
    font-size: 16px;
}

.Button.small {
    border-radius: 16px;
    padding: 0 16px;
    line-height: 30px;
    font-size: 14px;
}

.Button.brand {
    border-color: var(--vp-button-brand-border);
    color: var(--vp-button-brand-text);
    background-color: var(--vp-button-brand-bg);
}

.Button.brand:hover {
    border-color: var(--vp-button-brand-hover-border);
    color: var(--vp-button-brand-hover-text);
    background-color: var(--vp-button-brand-hover-bg);
}

.Button.brand:active {
    border-color: var(--vp-button-brand-active-border);
    color: var(--vp-button-brand-active-text);
    background-color: var(--vp-button-brand-active-bg);
}

.Button.alt {
    border-color: var(--vp-button-alt-border);
    color: var(--vp-button-alt-text);
    background-color: var(--vp-button-alt-bg);
}

.Button.alt:hover {
    border-color: var(--vp-button-alt-hover-border);
    color: var(--vp-button-alt-hover-text);
    background-color: var(--vp-button-alt-hover-bg);
}

.Button.alt:active {
    border-color: var(--vp-button-alt-active-border);
    color: var(--vp-button-alt-active-text);
    background-color: var(--vp-button-alt-active-bg);
}

.Button.sponsor {
    border-color: var(--vp-button-sponsor-border);
    color: var(--vp-button-sponsor-text);
    background-color: var(--vp-button-sponsor-bg);
}

.Button.sponsor:hover {
    border-color: var(--vp-button-sponsor-hover-border);
    color: var(--vp-button-sponsor-hover-text);
    background-color: var(--vp-button-sponsor-hover-bg);
}

.Button.sponsor:active {
    border-color: var(--vp-button-sponsor-active-border);
    color: var(--vp-button-sponsor-active-text);
    background-color: var(--vp-button-sponsor-active-bg);
}
</style>

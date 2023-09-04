<script setup lang="ts">
import config from './config/config.json';
import { computed, onMounted } from 'vue';
import { useStoreState, loadStore } from './composables/useStoreState';
import { GithubFilled } from '@ant-design/icons-vue';

const store = useStoreState();
const props = defineProps<{
    href?: string
    gh?: string
    cfg?: string
}>()

const ghTrimmed = computed(() => {
    if(props.gh) {
        return props.gh.replace(/^https?:\/\/github.com\//, '');
    }
    return '';
});

const ghDisplay = computed(() => {
    if(props.gh) {
        return ghTrimmed.value.replace(/tree\/master\//, '');
    }
    return '';
});

const href = computed(() => {
    if(props.href) {
        return props.href;
    }

    if(props.gh) {
        return `https://github.com/${ghTrimmed.value}`;
    }

    // special case for mas.storeUrl, so it points to correct country
    if (props.cfg === 'mas.storeUrl') {
        return store.masUrl.value;
    }

    if (props.cfg) {
        const keyPath = props.cfg.split('.');
        let value = config;
        for (const key of keyPath) {
            value = value[key];
        }
        return typeof value === 'string' ? value : '';
    }
    
    return '';
});

onMounted(() => {
    loadStore();
});

</script>

<template>
    <span v-if="props.gh"><GithubFilled /> <a :href="href"><span v-html="ghDisplay" /></a></span>
    <a v-else :href="href"><slot /></a>
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
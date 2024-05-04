<script setup lang="ts">
import config from './config/config.json';
import { computed } from 'vue';
import { useStoreState } from './composables/useStoreState';
import { GithubFilled } from '@ant-design/icons-vue';

const store = useStoreState();
const props = defineProps<{
    href?: string
    gh?: string
    cfg?: string
}>()

const ghTrimmed = computed(() => {
    if (props.gh) {
        return props.gh.replace(/^https?:\/\/github.com\//, '');
    }
    return '';
});

const ghDisplay = computed(() => {
    if (props.gh) {
        return ghTrimmed.value.replace(/tree\/[a-z0-9]+\//, '');
    }
    return '';
});

const href = computed(() => {
    if (props.href) {
        return props.href;
    }

    if (props.gh) {
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

</script>

<template>
    <span class="IconLink" v-if="props.gh">
        <GithubFilled class="GithubIcon" />
        <a :href="href"><span v-html="ghDisplay" /></a>
    </span>
    <a v-else :href="href">
        <slot />
    </a>
</template>

<style scoped>
.IconLink {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25em;
}

.GithubIcon {
    align-self: center;
}</style>

<script setup lang="ts">
import { data } from './data/extensions.data';
import { IconFilter } from '@tabler/icons-vue';
import DirectoryEntry from './DirectoryEntry.vue';
import { ElInput, ElRadioButton, ElRadioGroup, ElTag } from 'element-plus';
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Extension, Section } from './data/extensions-loader.js';
import { useData } from 'vitepress'
import { useDebounceFn } from '@vueuse/core';

// filter/arrange state
const defaultFilter = "";
const filter = ref(defaultFilter);
const defaultArrange = "categories";
const arrange = ref(defaultArrange);

// define the categories
const alphaSection: Section = {
    title: "All Extensions (Alphabetical)",
    members: Object.values(data.extensions).sort((a, b) => a.name.localeCompare(b.name)).map(e => e.identifier)
};
const newestSection: Section = {
    title: "All Extensions (Newest first)",
    members: Object.values(data.extensions).sort((a, b) => b.timestamp - a.timestamp).map(e => e.identifier)
};
const arrangements = new Map([
    ["categories", { label: "Categories", index: data.index }],
    ["alpha", { label: "A–Z", index: [alphaSection] }],
    ["newest", { label: "Newest", index: [newestSection] }],
]);

// total number of extensons
const total = computed(() => {
    return Object.keys(data.extensions).length;
});

// track filter term
const trackFilterTerm = useDebounceFn(() => {
    if (filter.value.length < 3) return;
    // va.track("Filter", { query: filter.value });
}, 1000);

// page title
const { title: { value: initialTitle } } = useData();
function title() {
    const parts: string[] = [];
    if (arrange.value !== defaultArrange) {
        parts.push(arrangements.get(arrange.value)?.label || arrange.value);
    }
    if (filter.value !== defaultFilter) {
        parts.push(`"${filter.value}"`);
    }
    if (parts.length > 0) {
        return `${initialTitle}: ${parts.join(", ")}`;
    } else {
        return initialTitle;
    }
};

// get params from url
function readParams() {
    return new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
}

// weite params to url, and update the filter
function writeParams(params: URLSearchParams) {
    trackFilterTerm();

    // update the url hash
    const url = new URL(window.location.toString());
    url.hash = params.toString();
    window.history.replaceState({}, "", url.toString());

    // update the title
    window.document.title = title();

    // update the filter 
    arrange.value = params.get("a") || defaultArrange;
    filter.value = params.get("q") || defaultFilter;    
}

// watch filter/arrange change
watch([filter, arrange], ([newFilter, newArrange]) => {
    const params = new URLSearchParams();
    if (newArrange !== defaultArrange) {
        params.set("a", newArrange);
    }
    if (newFilter !== defaultFilter) {
        params.set("q", newFilter);
    }
    writeParams(params);
});

// on hash change
function onHashChange() {
    writeParams(readParams());
}

// mount/unmount
onMounted(() => {
    onHashChange();
    window.addEventListener("onhashchange", onHashChange);
});
onBeforeUnmount(() => {
    window.removeEventListener("onhashchange", onHashChange);
});

const selectedIndex = computed(() => {
    return arrangements.get(arrange.value)?.index ?? [];
});

const filteredIndex = computed(() => {
    let count = 0;
    const index: { title: string, extensions: Extension[] }[] = [];
    for (const section of selectedIndex.value) {
        const extensions: Extension[] = [];
        for (const identifier of section.members) {
            const ext = data.extensions[identifier];
            if (ext.name.toLowerCase().includes(filter.value.toLowerCase())) {
                extensions.push(ext);
            }
        }
        if (extensions.length > 0) {
            count += extensions.length;
            index.push({
                title: section.title,
                extensions
            });
        }
    }
    return { index, count }
});
</script>

<template>
    <h1>PopClip Extensions Directory</h1>
    <div :class="$style.Directory">
        <div :class="$style.Header">
            <div :class="$style.Control">
                Arrange:
                <ElRadioGroup v-model="arrange">
                    <ElRadioButton label="categories">Categories</ElRadioButton>
                    <ElRadioButton label="alpha">A–Z</ElRadioButton>
                    <ElRadioButton label="newest">Newest</ElRadioButton>
                </ElRadioGroup>
            </div>
            <div :class="$style.Control">
                Filter:
                <ElInput v-model="filter" placeholder="Type to filter" :prefix-icon="IconFilter" />
            </div>
        </div>
        <div :class="$style.Info">
            Showing {{ filteredIndex.count }} of {{ total }} extensions
            <ElTag v-if="filter" closable @close="filter = ''">Filter: {{ filter }}</ElTag>
        </div>
        <div v-for="{ title, extensions } in filteredIndex.index">
            <h2>{{ title }}</h2>
            <DirectoryEntry v-for="ext in extensions" :key="ext.identifier" :ext="ext" />
        </div>
    </div>
</template>

<style module>
.Directory h2 {
    border: none;
    font-size: 1.2rem;
    margin: 0.5em 0 0.25em 0;
    padding: 0;
}

.Header {
    margin: 24px 0 16px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
}

.Control {
    display: flex;
    align-items: center;
    gap: 8px;
}

.Info {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 12px;

    font-size: 14px;
    text-align: left;
    color: var(--vp-c-text-2);
}
</style>

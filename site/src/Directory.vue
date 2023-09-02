<script setup lang="ts">
import { data } from './data/extensions.data';
import Page from './Page.vue';
import DirectoryEntry from './DirectoryEntry.vue';
import { Input, RadioButton, RadioGroup, Space } from 'ant-design-vue';
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Extension, Section } from './data/extensions-loader.js';
import { useData } from 'vitepress'

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
    // update the url hash
    const url = new URL(window.location.toString());
    url.hash = params.toString();
    window.history.replaceState({}, "", url.toString());

    // update the title
    window.document.title = title();

    // update the filter 
    arrange.value = params.get("arrange") || defaultArrange;
    filter.value = params.get("filter") || defaultFilter;
}

// watch filter/arrange change
watch([filter, arrange], ([newFilter, newArrange]) => {
    const params = new URLSearchParams();
    if (newArrange !== defaultArrange) {
        params.set("arrange", newArrange);
    }
    if (newFilter !== defaultFilter) {
        params.set("filter", newFilter);
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
    <Page>
        <h1>PopClip Extensions Directory</h1>
        <div :class="$style.Directory">
            <ClientOnly>
                <div :class="$style.Header">
                    <Space>
                        Arrange:
                        <RadioGroup v-model:value="arrange">
                            <RadioButton value="categories">Categories</RadioButton>
                            <RadioButton value="alpha">A–Z</RadioButton>
                            <RadioButton value="newest">Newest</RadioButton>
                        </RadioGroup>
                    </Space>

                    <Space>
                        Filter:
                        <Input type="text" v-model:value="filter" placeholder="Type to filter" />
                    </Space>
                </div>
            </ClientOnly>
            <div v-for="{ title, extensions } in filteredIndex.index">
                <h2>{{ title }}</h2>
                <DirectoryEntry v-for="ext in extensions" :key="ext.identifier" :ext="ext" />
            </div>
        </div>
        <div :class="$style.Footer">
            Showing {{ filteredIndex.count }} of {{ total }}.
        </div>
    </Page>
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
    gap: 8px;
}

.Footer {
    margin-top: 16px;
    font-size: 0.8em;
}
</style>

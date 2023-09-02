<script setup lang="ts">
import { data } from './data/extensions.data';
import Page from './Page.vue';
import DirectoryEntry from './DirectoryEntry.vue';
import { Input, RadioButton, RadioGroup, Space } from 'ant-design-vue';
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Extension } from './data/extensions-loader.js';
import { useData } from 'vitepress'
import { useDirectoryState } from './state/useDirectoryState';

const { filter, arrange, defaultFilter, defaultArrange } = useDirectoryState();

// page title
const title = useData().title;

// total number of extensons
const total = computed(() => {
    return Object.keys(data.extensions).length;
});

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

    // set title too
    window.document.title = filter.value ? `${title.value}: "${filter.value}"` : title.value;

    // update the filter 
    filter.value = params.get("filter") || defaultFilter;
    arrange.value = params.get("arrange") || defaultArrange;
}

// set state of filter/arrange
function set([newFilter, newArrange]) {
    const params = readParams();
    if (newFilter == defaultFilter) {
        params.delete("filter");
    } else {
        params.set("filter", newFilter);
    }
    if (newArrange == defaultArrange) {
        params.delete("arrange");
    } else {
        params.set("arrange", newArrange);
    }
    writeParams(params);
}

// watch filter/arrange change
watch([filter, arrange], set);

// on hash change
function onHashChange() {
    writeParams(readParams());
}

// mount/unmount
onMounted(() => {
    set([filter.value, arrange.value]);
    window.addEventListener("onhashchange", onHashChange);    
});
onBeforeUnmount(() => {
    window.removeEventListener("onhashchange", onHashChange);
});

const alphaIndex = computed(() => [{ title: "All Extensions (Alphabetical)", members: Object.values(data.extensions).sort((a, b) => a.name.localeCompare(b.name)).map(e => e.identifier) }]);
const newestIndex = computed(() => [{ title: "All Extensions (Newest first)", members: Object.values(data.extensions).sort((a, b) => b.timestamp - a.timestamp).map(e => e.identifier) }]);
const selectedIndex = computed(() => {
    if (arrange.value === "categories") {
        return data.index;
    } else if (arrange.value === "alpha") {
        return alphaIndex.value;
    } else if (arrange.value === "newest") {
        return newestIndex.value;
    } else {
        return [];
    }
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

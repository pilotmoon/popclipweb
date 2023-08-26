<script setup lang="ts">
import { data } from './data/extensions.data';
import Page from './Page.vue';
import DirectoryEntry from './DirectoryEntry.vue';
import { Input, RadioButton, RadioGroup, Space } from 'ant-design-vue';
import { computed, ref } from 'vue';
import { Extension } from './data/extensions-loader.js';

const filter = ref("");

const total = computed(() => {
    return Object.keys(data.extensions).length;
});

const alphaIndex = computed(() => [{ title: "All Extensions (Alphabetical)", members: Object.values(data.extensions).sort((a, b) => a.name.localeCompare(b.name)).map(e => e.identifier) }]);
const newestIndex = computed(() => [{ title: "All Extensions (Newest first)", members: Object.values(data.extensions).sort((a, b) => b.timestamp - a.timestamp).map(e => e.identifier) }]);
const selectedIndexName = ref("categories");
const selectedIndex = computed(() => {
    if (selectedIndexName.value === "categories") {
        return data.index;
    } else if (selectedIndexName.value === "alpha") {
        return alphaIndex.value;
    } else if (selectedIndexName.value === "newest") {
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
                        <RadioGroup v-model:value="selectedIndexName">
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

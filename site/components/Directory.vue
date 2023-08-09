<script setup lang="ts">
import extensionsData, { data } from './data/extensions.data';
import Icon from './Icon.vue';
import Theme from './Theme.vue';
import DownloadButton from './DownloadButton.vue';
import { Input, Button, RadioButton, RadioGroup, Space, Pagination } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';
import { Extension, Section } from './data/extensions-loader.js';

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
    <Theme>
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
                <!-- <Pagination :total="100" /> -->
            </ClientOnly>
            <div v-for="{ title, extensions } in filteredIndex.index">
                <h2>{{ title }}</h2>
                <div v-for="ext in extensions" :key="ext.identifier" :class="$style.DirectoryEntry">
                    <div :class="$style.EntryLeft">
                        <a :href="'x/' + ext.shortcode">
                            <Icon v-if="ext.iconUrlWhite && ext.iconUrlBlack" :srcDark="ext.iconUrlWhite"
                                :srcLight="ext.iconUrlBlack" />
                        </a>
                    </div>
                    <div :class="$style.EntryMain">
                        <div :class="$style.EntryHeader">
                            <a :href="'x/' + ext.shortcode">
                                <span :class="$style.EntryName">{{ ext.name }}</span>
                            </a>
                        </div>
                        <div v-html="ext.description"></div>
                    </div>
                    <div :class="$style.EntryRight">
                        <DownloadButton type="minimal" :url="ext.downloadUrl" />
                    </div>
                </div>
            </div>
        </div>
        <div :class="$style.Footer">
            Showing {{ filteredIndex.count }} of {{ total }}.
        </div>
    </Theme>
</template>

<style module>
.Directory {
    /* max-width: 768px; */
    margin-top: 32px;
    width: 100%;
}

.Directory h2 {
    border: none;
    font-size: 1.2rem;
    margin: 0.5em 0 0.25em 0;
    padding: 0;
}

.Header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
}

.ControlGroup {
    display: flex;
    gap: 8px;
    align-items: center;
}

.DirectoryEntry {
    display: flex;
    gap: 12px;
    background-color: var(--vp-c-bg-soft);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    position: relative;
}

.EntryMain {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
}

.EntryLeft,
.EntryRight {
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: auto;
}

.EntryLeft {
    width: 30px;
    font-size: 24px;
    opacity: 0.7;
}

.EntryName {
    font-weight: 600;
    font-size: 1.1em;
}

.EntryDescription {
    font-size: 0.9em;
    opacity: 0.8;
}

@media (max-width: 550px) {
    .EntryRight {
        display: none;
    }
}

.Footer {
    margin-top: 16px;
    font-size: 0.8em;
}
</style>

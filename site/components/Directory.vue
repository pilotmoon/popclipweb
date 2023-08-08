<script setup lang="ts">
import { data } from './data/extensions.data';
import Icon from './Icon.vue';
import Theme from './Theme.vue';
import DownloadButton from './DownloadButton.vue';
import { Input, Button, RadioButton, RadioGroup, Space } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';

const filter = ref("");

const flatIndex = computed(() => {
    return Object.values(data.extensions);
});

const filteredList = computed(() => {
    return flatIndex.value.filter((ext) =>
        ext.name.toLowerCase().includes(filter.value.toLowerCase())
    );
});
const arrange = ref("categories");
</script>

<template>
    <Theme>
        <div :class="$style.Directory">
            <div :class="$style.Header">
                <Space>
                    Arrange:
                    <RadioGroup v-model:value="arrange">
                        <RadioButton value="categories">Categories</RadioButton>
                        <RadioButton value="alpha">A-Z</RadioButton>
                        <RadioButton value="newest">Newest</RadioButton>
                    </RadioGroup>
                </Space>

                <Space>
                    Filter:
                    <Input type="text" v-model:value="filter" placeholder="Type to filter" />
                </Space>
            </div>
            <div v-for="(extension, index) in filteredList" :key="extension.identifier" :class="$style.DirectoryEntry">
                <div :class="$style.EntryLeft">
                    <a :href="'x/' + extension.shortcode">
                        <Icon v-if="extension.iconUrlWhite && extension.iconUrlBlack" :srcDark="extension.iconUrlWhite"
                            :srcLight="extension.iconUrlBlack" />
                    </a>
                </div>
                <div :class="$style.EntryMain">
                    <div :class="$style.EntryHeader">
                        <a :href="'x/' + extension.shortcode">
                            <span :class="$style.EntryName">{{ extension.name }}</span>
                        </a>
                    </div>
                    <div v-html="extension.description"></div>
                </div>
                <div :class="$style.EntryRight">                    
                    <DownloadButton v-if="extension.downloadUrl" type="icon" size="small" :url="extension.downloadUrl" />
                </div>
            </div>
        </div>
        <div :class="$style.Footer">
            Showing {{ filteredList.length }} of {{ data.extensions.length }}.
        </div>
    </Theme>
</template>

<style module>
.Directory {
    margin-top: 32px;
    width: 100%;
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

@media (max-width: 600px) {
    .EntryRight {
        display: none;
    }
}

.Footer {
    margin-top: 16px;
    font-size: 0.8em;
}
</style>

<script setup lang="ts">
import { data } from './data/extensions.data';
import Icon from './Icon.vue';
import Theme from './Theme.vue';
import { Input, Button, RadioButton, RadioGroup, Space } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';

const filter = ref("");
const filteredList = computed(() => {
    return data.extensions.filter((ext) =>
        ext.title.toLowerCase().includes(filter.value.toLowerCase())
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
                    Filter: <Input type="text" v-model:value="filter" placeholder="Type to filter" />
                </Space>                
            </div>
            <div v-for="(extension, index) in filteredList" :key="extension.hash" :class="$style.DirectoryEntry">
                <div :class="$style.EntryLeft">
                    <a :href="'x/' + extension.hash">
                        <Icon v-if="extension.imageDark && extension.imageLight" :srcDark="extension.imageDark"
                            :srcLight="extension.imageLight" />
                    </a>
                </div>
                <div :class="$style.EntryMain">
                    <div :class="$style.EntryHeader">
                        <a :href="'x/' + extension.hash">
                            <span :class="$style.EntryName">{{ extension.title }}</span>
                        </a>
                    </div>
                    <div v-html="extension.description"></div>
                </div>
                <div :class="$style.EntryRight">
                    <Button v-if="extension.download" type="primary" text="Download" :href="extension.download" />
                </div>
            </div>
        </div>
        <div :class="$style.Footer">
            Swowing {{ filteredList.length }} of {{ data.extensions.length }}.
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

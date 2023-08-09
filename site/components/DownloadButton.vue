<script setup lang="ts">
import MyButton from './Button.vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
import { computed } from 'vue';
const props = defineProps<{
    type?: "primary" | "secondary" | "minimal"
    url: string
}>();
const btnType = computed(() => {
    if (props.type === 'secondary' || props.type === 'minimal') {
        return 'alt'
    } else {
        return 'brand'
    }
})
const btnSize = computed(() => {
    if (props.type === 'secondary' || props.type === 'minimal') {
        return 'smaller'
    } else {
        return 'small'
    }
})
</script>

<template>
    <MyButton :theme="btnType" :size="btnSize" :href="props.url" itemscope>
        <div :class="$style.Inner"><DownloadOutlined /> Download</div>
    </MyButton>
</template>

<style module>
div.Inner {
    display: flex;
    gap: 0.5em;
    align-items: center;
}
</style>

<script setup lang="ts">
import { Button } from 'ant-design-vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
import Theme from './Theme.vue'
import { computed } from 'vue';
const props = defineProps<{
  size?: "small" | "middle" | "large",
  type?: "full" | "icon"
  url: string
}>();
const size = computed(() => {
    return props.size || "middle"
})
const showText = computed(() => {
    return props.type !== 'icon';
})

</script>

<template>
    <Theme>
        <Button type="primary" shape="default" :size="size" :href="props.url"><DownloadOutlined /><span v-if="showText">Download</span></Button>
    </Theme>
</template>


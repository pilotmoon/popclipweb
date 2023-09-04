<script setup lang="ts">
import va from '@vercel/analytics';
import MyButton from './MyButton.vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
const props = defineProps<{
  iconOnly?: boolean
  href: string
}>();
const track = () => {
  console.log(`Download ${props.href}`);
  va.track("Download", {
    url: props.href
  });
};
</script>

<template>
    <MyButton @click="track" :href="props.href">
        <DownloadOutlined /><span v-if="!iconOnly"> Download</span>
    </MyButton>
</template>
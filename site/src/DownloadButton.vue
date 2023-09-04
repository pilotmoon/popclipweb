<script setup lang="ts">
import va from '@vercel/analytics';
import MyButton from './MyButton.vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
const props = defineProps<{
  iconOnly?: boolean
  href: string
}>();
const track = () => {
  const info = { url: props.href }; 
  console.log("Download", JSON.stringify(info));
  va.track("Download", info);
};
</script>

<template>
    <MyButton @click="track" :href="props.href">
        <DownloadOutlined /><span v-if="!iconOnly"> Download</span>
    </MyButton>
</template>
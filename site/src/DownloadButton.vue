<script setup lang="ts">
import va from '@vercel/analytics';
import AaButton from './AaButton.vue';
import { IconDownload } from '@tabler/icons-vue';
const props = defineProps<{
  iconOnly?: boolean
  href: string
}>();
const track = () => {
  va.track("Download", { url: props.href });
};
</script>

<template>
    <AaButton @click="track" :href="props.href">
        <IconDownload style="margin: 0 -0.3em;" height="1.3em"/><span v-if="!iconOnly"> Download</span>
    </AaButton>
</template>
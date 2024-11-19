<script setup lang="ts">
import { computed } from 'vue';
import AaButton from './AaButton.vue';
import { IconDownload } from '@tabler/icons-vue';
const props = defineProps<{
  iconOnly?: boolean
  text?: string
  href: string
}>();
const track = () => {
  // va.track("Download", { url: props.href });
};
const text = computed(() => props.text ?? 'Download');
</script>

<template>
    <AaButton @click="track" :href="props.href">
        <IconDownload style="margin: 0 -0.3em;" height="1.3em"/><span v-if="!iconOnly"> {{ text }}</span>
    </AaButton>
</template>
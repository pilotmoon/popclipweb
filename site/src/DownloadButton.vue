<script setup lang="ts">
import Button from './Button.vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
const props = defineProps<{
  iconOnly?: boolean
}>();

</script>

<template>
    <Button>
        <DownloadOutlined /><span v-if="!iconOnly"> Download</span>
    </Button>
</template>
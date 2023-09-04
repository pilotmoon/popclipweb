<script setup lang="ts">
import MyButton from './MyButton.vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
const props = defineProps<{
  iconOnly?: boolean
}>();

</script>

<template>
    <MyButton>
        <DownloadOutlined /><span v-if="!iconOnly"> Download</span>
    </MyButton>
</template>
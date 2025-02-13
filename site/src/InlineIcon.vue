<script setup lang="ts">
import Icon from "./Icon.vue";

const props = defineProps<{
  spec: string;
}>();
</script>

<template>
  <Icon :spec="props.spec" :height="64" class="InlineIcon" />
</template>

<script setup lang="ts">
import Icon from './Icon.vue';
const props = defineProps<{
  params: any
}>();
</script>

<template>

<div :class="$style.Breadcrumb">
← <a href="/extensions/">Back to Directory</a>
</div>

<h1>
  <Icon :class="$style.HeaderIcon" v-if="params.iconUrlWhite && params.iconUrlBlack" :srcLight="params.iconUrlBlack" :srcDark="params.iconUrlWhite" />
  {{ params.name }}
</h1>

<p>Shortcode: {{ params.shortcode }}</p>

</template>

<style module>
div.Breadcrumb {
  margin-bottom: 1em;
}

img.HeaderIcon {
  margin-right: 4px;
}
</style>

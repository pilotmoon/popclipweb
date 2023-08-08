---
layout: docs
sidebar: false
aside: false
pref: false
next: false
---

<script setup lang="ts">
import Button from '/components/Button.vue';
import Icon from '/components/Icon.vue';
</script>

<div :class="$style.Breadcrumb">
← <a href="/extensions/">Back to Directory</a>
</div>

<h1>
  <Icon :class="$style.HeaderIcon" v-if="$params.iconUrlWhite && $params.iconUrlBlack" :srcLight="$params.iconUrlBlack" :srcDark="$params.iconUrlWhite" />
  {{ $params.name }}
</h1>

Shortcode: {{ $params.shortcode }}

<style module>
div.Breadcrumb {
  margin-bottom: 1em;
}

img.HeaderIcon {
  margin-right: 4px;
}
</style>

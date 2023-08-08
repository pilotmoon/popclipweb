---
sidebar: false
aside: false
pref: false
next: false
---
<script setup lang="ts">
import Button from '/components/Button.vue';
import Icon from '/components/Icon.vue';
</script>

← [Back to Directory](/extensions/)
<h1><Icon v-if="$params.imageDark && $params.imageLight" :srcLight="$params.imageLight" :srcDark="$params.imageDark" />&ensp;{{ $params.title}}</h1>

Shortcode: {{ $params.hash }}
Dark: {{ $params.imageDark }}

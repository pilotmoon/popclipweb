---
aside: false
---

<script setup lang="ts">
import { data } from './tweaks.data';
</script>

# Tweaks

Tweaks are extra settings that don't appear in PopClip's settings window (because I don't like the settings to be cluttered up with too many confusing options!) They are for fine-tuning, experiments and troubleshooting.You can change them with the `defaults` command in Terminal.

Settings that are currently tweaks could become main options in the future. If you find a setting is particularly useful for you, please [let me know](/support)! Your feedback always shapes the app.

## Changing a tweak

To change a tweak, run its `defaults write` command in Terminal. For example:

`defaults write com.pilotmoon.popclip ScreenshotMode -bool YES`

To put a tweak back to its default, delete it:

`defaults delete com.pilotmoon.popclip ScreenshotMode`

Most tweaks take effect straight away. Those marked **Restart** need you to quit
and restart PopClip.

<template v-for="section in data.sections" :key="section.id">
<h2 :id="section.id" tabindex="-1">{{ section.title }} <a class="header-anchor" :href="'#' + section.id" aria-hidden="true"></a></h2>
<p>{{ section.description }}</p>
<div v-for="tweak in section.tweaks" :key="tweak.key" class="tweak">
<h3 :id="tweak.key" tabindex="-1"><code>{{ tweak.key }}</code> <a class="header-anchor" :href="'#' + tweak.key" aria-hidden="true"></a></h3>
<p v-html="tweak.summaryHtml"></p>
<p class="tweak-facts">
  {{ tweak.type === 'bool' ? 'Yes/no' : tweak.type === 'number' ? 'Number' : 'Text' }}
  · Default: {{ tweak.defaultText }}
  <template v-if="tweak.rangeText"> · Range: {{ tweak.rangeText }}</template>
  <template v-if="tweak.timing === 'restart'"> · <strong>Restart</strong></template>
</p>
<div class="language-sh"><pre><code>{{ tweak.writeCommand }}</code></pre></div>
</div>
</template>

<style scoped>
.tweak-facts {
  color: var(--vp-c-text-2);
  font-size: 0.9em;
}
</style>

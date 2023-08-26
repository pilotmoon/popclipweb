<script setup lang="ts">
import { computed } from 'vue'
/* This is ripped from VPButton in default theme */
const props = defineProps<{
  tag?: string
  size?: 'smaller' | 'small' | 'medium' | 'big'
  theme?: 'brand' | 'alt' | 'outline'
  href?: string
}>()

const classes = computed(() => [
  props.size ?? 'medium',
  props.theme ?? 'brand'
])

const component = computed(() => {
  if (props.tag) {
    return props.tag
  }

  return props.href ? 'a' : 'button'
})
</script>

<template>
  <component :is="component" class="Button" :class="classes" :href="href">
    <div class="ButtonInner">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.ButtonInner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
}

.Button {
  display: inline-block;
  border: 1px solid transparent;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}

.Button:hover {
  text-decoration: none;
}

.Button.medium {
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
}

.Button.medium .ButtonInner {
  height: 38px;
}

.Button.big {
  border-radius: 24px;
  padding: 0 24px;
  line-height: 46px;
  font-size: 16px;
}

.Button.big .ButtonInner {
  height: 46px;
}

.Button.small {
  border-radius: 16px;
  padding: 0 16px;
  line-height: 30px;
  font-size: 14px;


}

.Button.small .ButtonInner {
  height: 30px;
}

.Button.smaller {
  border-radius: 12px;
  padding: 0 12px;
  line-height: 24px;
  font-size: 13px;
  font-weight: 500;


}

.Button.smaller .ButtonInner {
  height: 24px;
}




.Button.brand {
  border-color: var(--vp-button-brand-border);
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
}

.Button.brand:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}

.Button.brand:active {
  border-color: var(--vp-button-brand-active-border);
  color: var(--vp-button-brand-active-text);
  background-color: var(--vp-button-brand-active-bg);
}

.Button.alt {
  border-color: var(--vp-button-alt-border);
  color: var(--vp-button-alt-text);
  background-color: var(--vp-button-alt-bg);
}

.Button.alt:hover {
  border-color: var(--vp-button-alt-hover-border);
  color: var(--vp-button-alt-hover-text);
  background-color: var(--vp-button-alt-hover-bg);
}

.Button.alt:active {
  border-color: var(--vp-button-alt-active-border);
  color: var(--vp-button-alt-active-text);
  background-color: var(--vp-button-alt-active-bg);
}

.Button.outline {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  background-color: transparent;
}

.Button.outline:hover {
  border-color: var(--vp-c-brand-light);
  color: var(--vp-c-brand-light);
  background-color: transparent;
}

.Button.outline:active {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  background-color: transparent;
}
</style>

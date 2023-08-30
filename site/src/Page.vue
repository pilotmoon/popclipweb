<script setup lang="ts">
import Theme from './Theme.vue';
</script>

<template>
    <div :class="$style.Page">
        <Theme>
            <slot />
        </Theme>
    </div>
</template>

<style module>
/* Based on as VPDoc & vp-doc.css */
.Page {
    padding: 32px 24px 96px;
    width: 100%;
    max-width: 740px;
    margin: 0 auto;
}

.Page h1,
.Page h2,
.Page h3,
.Page h4,
.Page h5,
.Page h6 {
    position: relative;
    font-weight: 600;
    outline: none;
}

.Page h1 {
    letter-spacing: -0.02em;
    line-height: 40px;
    font-size: 28px;
}

@media (min-width: 768px) {
    .Page h1 {
        letter-spacing: -0.02em;
        line-height: 40px;
        font-size: 32px;
    }
}

/**
 * Paragraph and inline elements
 * -------------------------------------------------------------------------- */

 .Page a {
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition:
    color 0.25s,
    opacity 0.25s;
}

.Page a:hover {
  color: var(--vp-c-brand-2);
}

.Page strong {
    font-weight: 600;
}

/**
 * Decorational elements
 * -------------------------------------------------------------------------- */

.Page hr {
  margin: 16px 0;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
}

/**
 * Code
 * ---

/* inline code */
.Page :not(pre, h1, h2, h3, h4, h5, h6) > code {
  font-size: var(--vp-code-font-size);
  color: var(--vp-code-color);
}

.Page :not(pre) > code {
  border-radius: 4px;
  padding: 3px 6px;
  background-color: var(--vp-code-bg);
  transition:
    color 0.25s,
    background-color 0.5s;
}

.Page a > code {
  color: var(--vp-code-link-color);
}

.Page a:hover > code {
  color: var(--vp-code-link-hover-color);
}

.Page h1 > code,
.Page h2 > code,
.Page h3 > code {
  font-size: 0.9em;
}

</style>

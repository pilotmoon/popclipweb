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
    color: var(--vp-c-brand);
}

.Page a:hover {
    text-decoration: underline dotted;
    text-underline-offset: 2px;
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

</style>

<script setup lang="ts">
import config from "./config/config.json";
import { computed } from "vue";
import { MailOutlined } from "@ant-design/icons-vue";
import { supportMailtoHref } from "./helpers/supportMailto";

const props = defineProps<{
  email?: string;
  subject?: string;
  body?: string; // sits above the writing space
  footer?: string; // sits below the writing space
}>();

const email = computed(() => props.email || config.pilotmoon.supportEmail);

const href = computed(() => supportMailtoHref(props));
</script>

<template>
  <span class="IconLink">
    <MailOutlined class="Icon" />
    <a :href="href"><span v-html="email" /></a>
  </span>
</template>

<style scoped>
.IconLink {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25em;
}
.Icon {
  align-self: center;
  margin-bottom: -0.1em;
}
</style>

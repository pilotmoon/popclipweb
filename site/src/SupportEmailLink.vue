<script setup lang="ts">
import config from "./config/config.json";
import { computed } from "vue";
import { MailOutlined } from "@ant-design/icons-vue";

const props = defineProps<{
  email?: string;
  subject?: string;
  body?: string;
}>();

const email = computed(() => props.email || config.pilotmoon.supportEmail);

const href = computed(() => {
  const url = new URL(`mailto:${encodeURIComponent(email.value)}`);  
  if (props.subject) {    
    url.searchParams.set("subject", props.subject);
  }
  if (props.body) {    
    url.searchParams.set("body", `${props.body.trim()}\n\n`);
  }
  return url.href.replaceAll("+", "%20");
});
</script>

<template>
    <span class="IconLink">
        <MailOutlined class="Icon" />
        <a :href="href"><span v-html=email /></a>
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
}</style>

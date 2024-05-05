<script setup lang="ts">
import config from "./config/config.json";
import { computed } from "vue";
import { useStoreState } from "./composables/useStoreState";
import { GithubFilled } from "@ant-design/icons-vue";

const store = useStoreState();
const props = defineProps<{
  href?: string;
  cfg?: string;
}>();

const ghDisplay = computed(() => {
  console.log(props.href);
  let result = "";
  if (props.href?.startsWith("https://github.com/")) {
    result = props.href.replace(/^https:\/\/github.com\//, "");
    result = result.replace(/tree\/[a-z0-9]+\//, ".../");
  } else if (props.href?.startsWith("https://gist.github.com/")) {
    result = props.href.replace(/https:\/\/gist.github.com\//, "gist:");
    result = result.replace(/\/[a-f0-9]+$/, "/...");
  }
  return result;
});

const href = computed(() => {
  if (props.href) {
    return props.href;
  }

  // special case for mas.storeUrl, so it points to correct country
  if (props.cfg === "mas.storeUrl") {
    return store.masUrl.value;
  }

  if (props.cfg) {
    const keyPath = props.cfg.split(".");
    let value = config;
    for (const key of keyPath) {
      value = value[key];
    }
    return typeof value === "string" ? value : "";
  }

  return "";
});
</script>

<template>
    <span class="IconLink" v-if=ghDisplay>
        <GithubFilled class="GithubIcon" />
        <a :href="href"><span v-html=ghDisplay /></a>
    </span>
    <a v-else :href="href">
        <slot />
    </a>
</template>

<style scoped>
.IconLink {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25em;
}

.GithubIcon {
    align-self: center;
}</style>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import config from "./config/config.json";
import { querifyDescriptor } from "./helpers/iconDescriptor.js";
import { useData } from "vitepress";

const cacheKey = "a2";
const { isDark } = useData();
const props = defineProps<{
  spec: string;
  height?: number;
}>();

const src = ref(iconUrl(props.spec, "#000000"));

function setSrc() {
  src.value = iconUrl(props.spec, isDark.value ? "#ffffff" : "#000000");
}

onMounted(setSrc);
watch(isDark, setSrc);
watch(props, setSrc);

function iconUrl(specifier: string, color: string) {
  const query = querifyDescriptor(
    {
      specifier: specifier.trim(),
      color,
      height:
        typeof props.height === "number" && props.height > 0
          ? props.height * 2
          : 256,
    },
    cacheKey,
  );
  return `${config.pilotmoon.iconsRoot}/icon?${query}`;
}

function showPlaceholder() {
  src.value = iconUrl(
    "iconify:ph:placeholder-thin",
    isDark.value ? "#333333" : "#cccccc",
  );
}
</script>

<template>
  <img :src="src" @error="showPlaceholder" />
</template>

<script setup lang="ts">
import { ElSwitch } from "element-plus";
import { useEditionSwitcherState } from "./composables/useEditionSwitcherState";
import { onMounted } from "vue";
import { SetappIcon } from "vue3-simple-icons";
const { edition, defaultEdition } = useEditionSwitcherState();
onMounted(() => {
  // force switch to update on page load
  const value = edition.value;
  edition.value = defaultEdition;
  setTimeout(() => {
    edition.value = value;
  }, 0);
});
</script>

<template>
  <div :class="$style.EditionSwitcher">
    View docs for PopClip edition:
    <ElSwitch
      v-model="edition"
      inactive-value="base"
      active-value="setapp"
      inactive-text="Standalone or Mac App Store"
      active-text="Setapp"
      inactive-color="var(--mid-grey)"
      active-color="var(--mid-grey)"
      :active-action-icon="SetappIcon"
    />
  </div>
</template>

<style module>
.EditionSwitcher {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 0 12px;
  flex-wrap: wrap;
}
</style>

<script setup lang="ts">
// The available-variables table on the script-variables page, with a control
// to switch the Name column between Shell Script and AppleScript forms.
// Data lives in scriptVariables.ts, shared with the llmDocs twin generator.
import { ref } from "vue";
import { ElRadioGroup, ElRadioButton } from "element-plus";
import {
  scriptVariables,
  shellVariableName,
  applescriptPlaceholder,
} from "./scriptVariables";

const target = ref<"shell" | "applescript">("shell");

function name(key: string): string {
  return target.value === "shell"
    ? shellVariableName(key)
    : applescriptPlaceholder(key);
}

// the descriptions use only backtick code spans and [label](target) links
function renderInlineMarkdown(source: string): string {
  return source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}
</script>

<template>
  <div>
    <div :class="$style.switcher">
      Show variable names for:
      <ElRadioGroup v-model="target" size="small">
        <ElRadioButton value="shell">Shell Script</ElRadioButton>
        <ElRadioButton value="applescript">AppleScript</ElRadioButton>
      </ElRadioGroup>
    </div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="variable in scriptVariables" :key="variable.key">
          <td>
            <code>{{ name(variable.key) }}</code>
          </td>
          <!-- eslint-disable-next-line vue/no-v-html -- our own docs strings -->
          <td v-html="renderInlineMarkdown(variable.description)"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style module>
.switcher {
  display: flex;
  align-items: center;
  gap: 0 12px;
  flex-wrap: wrap;
  margin: 16px 0;
  font-size: 14px;
}
</style>

<script setup lang="ts">
import { computed, ref } from "vue";

// Interactive companion for the "Client identifiers, and util.clarify"
// section of dev/auth.md: paste JSON, get the obscured blob (Base64, then
// ROT13) that util.clarify deciphers.
const input = ref('{ "client_id": "abc123", "client_secret": "shhh" }');

const result = computed(() => {
  try {
    const canonical = JSON.stringify(JSON.parse(input.value));
    const bytes = new TextEncoder().encode(canonical);
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    const obscured = btoa(binary).replace(/[a-z]/gi, (c) =>
      String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < "n" ? 13 : -13)),
    );
    return { ok: true, text: obscured };
  } catch {
    return { ok: false, text: "Enter a valid JSON object above." };
  }
});
</script>

<template>
  <div class="ObscureTool">
    <label>JSON in:</label>
    <textarea v-model="input" rows="3" spellcheck="false"></textarea>
    <label>Obscured string out:</label>
    <code :class="{ invalid: !result.ok }">{{ result.text }}</code>
  </div>
</template>

<style scoped>
.ObscureTool {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}
.ObscureTool label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}
.ObscureTool textarea {
  display: block;
  width: 100%;
  resize: vertical;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 12px;
}
.ObscureTool code {
  display: block;
  font-size: 13px;
  word-break: break-all;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 8px;
  user-select: all;
}
.ObscureTool code.invalid {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-base);
}
</style>

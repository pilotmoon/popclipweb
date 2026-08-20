<script setup lang="ts">
// Self-service claim form for the student offer. Honor-system: ticking the
// confirmation reveals the institution/country fields, and submitting asks
// the Twix backend to mint a signed `student` offer link (the claimed
// details are signed into it and end up recorded on the license). The
// "Preparing your offer" pause is a little ceremony — the mint itself is
// quick — before jumping to the minted offer page.
import { computed, ref } from "vue";
import { z } from "zod";
import config from "./config/config.json";
import { useDeploymentInfo } from "./composables/useDeploymentInfo";
import { useLogger } from "./composables/useLogger";
import paddleCountries from "./helpers/countries/paddleCountries.json";

const log = useLogger();
const sandbox = useDeploymentInfo().isLocalhost;

const confirmed = ref(false);
const institution = ref("");
const country = ref("");
const busy = ref(false);
const failed = ref(false);

const countries = Object.entries(paddleCountries as Record<string, string>)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const canSubmit = computed(
  () => confirmed.value && institution.value.trim().length >= 2 && country.value !== "" && !busy.value,
);

const ZMintResponse = z.object({ query: z.string().min(1) });

async function submit() {
  if (!canSubmit.value) return;
  failed.value = false;
  busy.value = true;
  try {
    const base = sandbox ? config.pilotmoon.frontendRoot_sandbox : config.pilotmoon.frontendRoot;
    const query = new URLSearchParams({ edu: institution.value.trim(), cou: country.value });
    // hold the "Preparing" state for a few seconds alongside the mint call
    const [res] = await Promise.all([
      fetch(`${base}/store/getStudentOffer?${query}`),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
    if (!res.ok) throw new Error(`mint request failed: ${res.status}`);
    const { query: offerQuery } = ZMintResponse.parse(await res.json());
    window.location.href = `/offer#${offerQuery}`;
  } catch (e) {
    log("Failed to mint student offer", e);
    failed.value = true;
    busy.value = false;
  }
}
</script>

<template>
  <div :class="$style.box">
    <div v-if="busy" :class="$style.preparing">
      <div :class="$style.spinner"></div>
      <div>Preparing your offer…</div>
    </div>
    <template v-else>
      <label :class="$style.confirmRow">
        <input type="checkbox" v-model="confirmed" />
        <span>I confirm that I am a student in full-time education.</span>
      </label>
      <div v-if="confirmed" :class="$style.fields">
        <label :class="$style.fieldLabel">
          Name of educational institution
          <input :class="$style.textInput" type="text" v-model="institution" maxlength="80" placeholder="e.g. University of Example" />
        </label>
        <label :class="$style.fieldLabel">
          Country
          <select :class="$style.select" v-model="country">
            <option value="" disabled>Select country…</option>
            <option v-for="c in countries" :key="c.code" :value="c.code">{{ c.name }}</option>
          </select>
        </label>
        <p v-if="failed" :class="$style.error">
          Sorry, something went wrong preparing your offer. Please try again, or <a href="/support">contact support</a>.
        </p>
        <AaButton :class="$style.submit" theme="brand" size="medium" :disabled="!canSubmit" @click="submit">Claim student discount</AaButton>
      </div>
    </template>
  </div>
</template>

<style module>
.box {
  max-width: 30em;
  margin: 24px auto;
  padding: 20px 22px;
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
}

.confirmRow {
  display: flex;
  gap: 10px;
  align-items: baseline;
  cursor: pointer;
}

.fields {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.fieldLabel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.textInput,
.select {
  font-size: 14px;
  padding: 7px 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.textInput:focus,
.select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.submit {
  align-self: flex-start;
}

/* `.box` prefix raises specificity above VitePress's `.vp-doc p` rule. */
.box .error {
  font-size: 14px;
  color: var(--vp-c-danger-1);
  margin: 0;
}

.preparing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 18px 0;
}

.spinner {
  width: 26px;
  height: 26px;
  border: 3px solid var(--vp-c-border);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: student-spin 0.8s linear infinite;
}

@keyframes student-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

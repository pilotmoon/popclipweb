<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

// Pre-checkout dialog: collects the buyer's email and license name before
// opening the Paddle checkout. All fields are optional — left empty, the
// checkout behaves as if there were no pre-checkout step (Paddle collects
// the email; the license is issued nameless). The card name that Paddle
// collects belongs to the payer, which is not necessarily the licensee
// (and isn't collected at all for e.g. Apple Pay), so the name is asked
// for explicitly and passed through the checkout's customData.
//
// With `ownerEmailOption`, a checkbox offers registering the license to a
// different email than the payer's (buying for somebody else); the owner
// email is passed through customData too.

const props = defineProps<{
  open: boolean;
  title: string;
  ownerEmailOption: boolean;
  initialName: string;
  initialEmail: string;
}>();

const emit = defineEmits<{
  (e: "confirm", details: { email: string; name: string | null; ownerEmail: string | null }): void;
  (e: "cancel"): void;
}>();

const dialogEl = ref<HTMLDialogElement>();
const formEl = ref<HTMLFormElement>();
const emailEl = ref<HTMLInputElement>();
const ownerEmailEl = ref<HTMLInputElement>();
const email = ref("");
const name = ref("");
const differentOwner = ref(false);
const ownerEmail = ref("");

watch(
  () => props.open,
  async (open) => {
    if (open) {
      email.value = props.initialEmail;
      name.value = props.initialName;
      differentOwner.value = false;
      ownerEmail.value = "";
      dialogEl.value?.showModal();
      await nextTick();
      emailEl.value?.focus();
      emailEl.value?.select();
    } else {
      dialogEl.value?.close();
    }
  },
);

// focus the owner email field when the checkbox reveals it
watch(differentOwner, async (on) => {
  if (on) {
    await nextTick();
    ownerEmailEl.value?.focus();
  }
});

function confirm() {
  // empty fields are fine; this catches malformed non-empty emails
  if (!formEl.value?.checkValidity()) {
    formEl.value?.reportValidity();
    return;
  }
  emit("confirm", {
    email: email.value.trim(),
    name: name.value.trim() || null,
    ownerEmail: differentOwner.value ? ownerEmail.value.trim() || null : null,
  });
}

// fires on Esc and on dialogEl.close(); only propagate a real dismissal
function onClose() {
  if (props.open) {
    emit("cancel");
  }
}

// Dismiss on a backdrop click. Two subtleties: the <dialog> element's own
// panel (padding, gaps between fields) also targets the dialog, so a real
// backdrop press is identified by its coordinates being outside the
// panel's box; and a click's target is the common ancestor of where the
// press began and ended, so a drag (e.g. a text selection overshooting a
// field) must not count — both the press and the release have to land on
// the backdrop.
function onBackdrop(event: MouseEvent) {
  if (event.target !== dialogEl.value) return false;
  const rect = dialogEl.value.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}
let pressStartedOnBackdrop = false;
function onPointerDown(event: PointerEvent) {
  pressStartedOnBackdrop = onBackdrop(event);
}
function onClick(event: MouseEvent) {
  if (pressStartedOnBackdrop && onBackdrop(event)) {
    emit("cancel");
  }
}
</script>

<template>
  <dialog ref="dialogEl" :class="$style.dialog" @close="onClose" @pointerdown="onPointerDown" @click="onClick">
    <form ref="formEl" method="dialog" novalidate @submit.prevent="confirm">
      <!-- divs, not <p>: VitePress's .vp-doc p margin rule outranks our classes -->
      <div :class="$style.title">{{ title }}</div>
      <label :class="$style.label" for="precheckout-email">Email</label>
      <input
        id="precheckout-email"
        ref="emailEl"
        v-model="email"
        :class="$style.input"
        type="email"
        name="email"
        autocomplete="email"
        maxlength="200"
        data-1p-ignore
      />
      <div :class="$style.hint">The license key and invoice will be sent here.</div>
      <label v-if="ownerEmailOption" :class="$style.checkboxLabel">
        <input v-model="differentOwner" type="checkbox" />
        I am buying for somebody else
      </label>
      <template v-if="ownerEmailOption && differentOwner">
        <label :class="$style.label" for="precheckout-owner-email">License Owner Email</label>
        <input
          id="precheckout-owner-email"
          ref="ownerEmailEl"
          v-model="ownerEmail"
          :class="$style.input"
          type="email"
          name="owner-email"
          maxlength="200"
          data-1p-ignore
        />
        <div :class="$style.hint">The license key will be registered to this email address. (No emails will be sent to this address.)</div>
      </template>
      <label :class="$style.label" for="precheckout-name">{{ ownerEmailOption && differentOwner ? "License Owner Name" : "Name" }}</label>
      <input id="precheckout-name" v-model="name" :class="$style.input" type="text" name="name" autocomplete="name" maxlength="100" data-1p-ignore />
      <div :class="$style.hint">This name will be displayed on the license key.</div>
      <div :class="$style.buttons">
        <AaButton theme="alt" size="small" type="button" @click="emit('cancel')">Cancel</AaButton>
        <AaButton theme="brand" size="small" type="submit">Continue to Checkout</AaButton>
      </div>
    </form>
  </dialog>
</template>

<style module>
.dialog {
  margin: auto;
  padding: 24px;
  width: min(90vw, 400px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.dialog::backdrop {
  background: rgba(0, 0, 0, 0.4);
}

.title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.label {
  display: block;
  margin: 14px 0 6px 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.hint {
  margin: 5px 0 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.checkboxLabel {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.input {
  width: 100%;
  padding: 8px 12px;
  font-size: 15px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}

.input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
</style>

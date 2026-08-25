<script setup type="ts">
import { computed, onMounted, ref, watch } from "vue";
import { readParams } from "/src/helpers/readParams";
import { useOutstandingPurchase } from "./composables/useOutstandingPurchase";

// Modal shown on the buy pages when this tab has a checkout still hanging.
// Nothing is rendered in the ordinary case — no attempts, or none that came
// to anything — and no request is made either.
//
// Modal rather than a panel on the page, because the buyers it is for are
// about to pay a second time or write to support, and a box above the price
// cards is the sort of thing someone in that state scrolls straight past.
// Closing it settles the matter: the buy button behaves normally afterwards.
// Someone who has read this and still wants to buy is entitled to, and it is
// not our place to keep refusing.
const { outstanding, noticeOpen, check, dismiss, goToStatus } =
  useOutstandingPurchase();

const dialogEl = ref();

const NOTICES = {
  paying: {
    title: "You have already paid",
    body: "We are confirming your payment now. Please do not buy again.",
    action: "Check your payment",
  },
  unconfirmed: {
    title: "You may have already paid",
    body: "A payment you started has not been confirmed yet. This can take up to 10 minutes.",
    action: "Check your payment",
  },
  undelivered: {
    title: "You have a license key",
    body: "You bought a PopClip license recently and this browser has not shown it to you yet.",
    action: "See your license key",
  },
};

const notice = computed(() => NOTICES[outstanding.value?.kind] ?? null);

watch(noticeOpen, (open) => {
  if (open) {
    dialogEl.value?.showModal();
  } else {
    dialogEl.value?.close();
  }
});

onMounted(() => {
  // #preview=<kind> shows a notice without a purchase, matching the hook of
  // the same name on the license page. These states need a payment caught
  // mid-flight to reach honestly, which a sandbox cannot produce for the
  // deferred methods that motivate them. Harmless on production: it renders
  // static copy and makes no request.
  const preview = readParams().get("preview");
  if (preview && NOTICES[preview]) {
    outstanding.value = {
      kind: preview,
      attempt: { flowId: "preview", transactionId: null, at: Date.now() },
    };
    return;
  }
  check();
});

// fires on Esc and on close(); either way the buyer has been told
function onClose() {
  dismiss();
}

// Dismiss on a backdrop click, by the same reasoning as PreCheckoutDialog:
// the panel's own padding also targets the dialog, so a real backdrop press
// is one whose coordinates fall outside the panel; and both the press and
// the release have to land there, so that a drag does not count.
function onBackdrop(event) {
  if (event.target !== dialogEl.value) return false;
  const rect = dialogEl.value.getBoundingClientRect();
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
}
let pressStartedOnBackdrop = false;
function onPointerDown(event) {
  pressStartedOnBackdrop = onBackdrop(event);
}
function onClick(event) {
  if (pressStartedOnBackdrop && onBackdrop(event)) {
    dismiss();
  }
}
</script>

<template>
  <dialog ref="dialogEl" :class="$style.dialog" @close="onClose" @pointerdown="onPointerDown" @click="onClick">
    <!-- divs, not <p>: VitePress's .vp-doc p margin rule outranks our classes -->
    <div v-if="notice" :class="$style.title">{{ notice.title }}</div>
    <div v-if="notice" :class="$style.body">{{ notice.body }}</div>
    <div :class="$style.buttons">
      <AaButton theme="alt" size="small" type="button" @click="dismiss">Close</AaButton>
      <AaButton theme="brand" size="small" type="button" @click="goToStatus">{{ notice?.action }}</AaButton>
    </div>
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
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
}

.body {
  font-size: 15px;
  line-height: 22px;
  color: var(--vp-c-text-2);
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
</style>

<script setup type="ts">
import { onMounted } from "vue";
import { readParams } from "/src/helpers/readParams";
import { useOutstandingPurchase } from "./composables/useOutstandingPurchase";

// Notice shown at the top of the buy pages when this tab has a checkout still
// hanging. Nothing is rendered in the ordinary case — no attempts, or none
// that came to anything — and no request is made either.
const { outstanding, check, goToStatus } = useOutstandingPurchase();

const PREVIEW_KINDS = ["paying", "undelivered", "unconfirmed"];

onMounted(() => {
  // #preview=<kind> shows a notice without a purchase, matching the hook of
  // the same name on the license page. These states need a payment caught
  // mid-flight to reach honestly, which a sandbox cannot produce for the
  // deferred methods that motivate them. Harmless on production: it renders
  // static copy and makes no request.
  const preview = readParams().get("preview");
  if (preview && PREVIEW_KINDS.includes(preview)) {
    outstanding.value = {
      kind: preview,
      attempt: { flowId: "preview", transactionId: null, at: Date.now() },
    };
    return;
  }
  check();
});
</script>

<template>
  <div v-if="outstanding?.kind === 'paying'" class="warning custom-block">
    <p class="custom-block-title">You have already paid</p>
    <p>We are confirming your payment now. Please do not buy again.</p>
    <p><a href="#" @click.prevent="goToStatus">Check your purchase</a></p>
  </div>
  <div v-else-if="outstanding?.kind === 'undelivered'" class="tip custom-block">
    <p class="custom-block-title">You have a license key</p>
    <p>You bought a PopClip license recently and this browser has not shown it to you yet.</p>
    <p><a href="#" @click.prevent="goToStatus">See your license key</a></p>
  </div>
  <div v-else-if="outstanding?.kind === 'unconfirmed'" class="info custom-block">
    <p class="custom-block-title">You may have already paid</p>
    <p>A payment you started has not been confirmed yet. This can take up to 10 minutes.</p>
    <p><a href="#" @click.prevent="goToStatus">Check your payment</a></p>
  </div>
</template>

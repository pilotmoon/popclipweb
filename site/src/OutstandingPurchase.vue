<script setup type="ts">
import { onMounted } from "vue";
import { useOutstandingPurchase } from "./composables/useOutstandingPurchase";

// Notice shown at the top of the buy pages when this tab has a checkout still
// hanging. Nothing is rendered in the ordinary case — no attempts, or none
// that came to anything — and no request is made either.
const { outstanding, check, goToStatus } = useOutstandingPurchase();

onMounted(check);
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
  <div v-else-if="outstanding?.kind === 'unfinished'" class="info custom-block">
    <p>You started a purchase but did not finish it. You have not been charged.</p>
    <p><a href="#" @click.prevent="goToStatus">Check your purchase</a></p>
  </div>
</template>

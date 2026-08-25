<script setup type="ts">
import { onMounted, ref } from "vue";
import { VueSpinnerGears } from "vue3-spinners";
import { usePurchaseInfo } from "./composables/usePurchaseInfo";
import { useTitle } from "@vueuse/core";
import config from "./config/config.json";
import { useDeploymentInfo } from "./composables/useDeploymentInfo";
import { useLogger } from "./composables/useLogger";
import { formatDate } from "/src/helpers/formatters";
import { kaboom } from "/src/helpers/confetti";
import { infoBlock, supportMailtoHref } from "/src/helpers/supportMailto";
import { readParams } from "/src/helpers/readParams";

const log = useLogger();
const purchaseInfo = usePurchaseInfo();
const title = useTitle();
const timestamp = new Date().toISOString();
const licenseKey = ref(null);
// payment progress reported by the backend when there's no license yet
// ({ object: "transactionStatus", status, paymentMethodType? })
const txnStatus = ref(null);
const sandbox = useDeploymentInfo().isLocalhost;
const countdown = ref(60);
let lastError = null;

const State = {
  NoSession: Symbol("no-session"),
  Loading: Symbol("loading"),
  Delayed: Symbol("delayed"),
  PaymentPending: Symbol("payment-pending"),
  PaymentInProgress: Symbol("payment-in-progress"),
  PaymentFailed: Symbol("payment-failed"),
  Done: Symbol("done"),
};

const state = ref(State.Loading);

// how long to keep slow-polling once the payment is known to be pending
// capture (e.g. WeChat Pay typically captures within ~10 minutes)
const PENDING_POLL_INTERVAL_MS = 10000;
const PENDING_POLL_LIMIT = 180; // × 10s = 30 minutes

onMounted(async () => {
  // #preview=<state> shows a waiting/failure state without a purchase, for
  // checking pages that only appear mid-payment (e.g. #preview=in_progress,
  // optionally &method=pix). Harmless on production: renders static copy
  // only, no license data involved.
  const preview = readParams().get("preview");
  if (preview) {
    const previewStates = {
      pending: State.PaymentPending,
      in_progress: State.PaymentInProgress,
      failed: State.PaymentFailed,
      delayed: State.Delayed,
    };
    if (previewStates[preview]) {
      txnStatus.value = {
        object: "transactionStatus",
        status: preview,
        paymentMethodType: readParams().get("method") ?? undefined,
      };
      state.value = previewStates[preview];
      title.value = "Preview";
      log(`[license] preview mode: ${preview}`);
      return;
    }
  }
  // Either id identifies the order to the backend, and the transaction id is
  // the stronger of the two. Only when the tab holds neither is there nothing
  // to ask about — a checkout that happened in another tab or another session.
  if (!purchaseInfo.flowId.value && !purchaseInfo.transactionId.value) {
    log("[license] no flowId or transactionId in session — checkout did not complete here, or session was lost");
    state.value = State.NoSession;
    title.value = "Purchase Not Found";
    return;
  }
  log(`[license] polling for license, flowId=${purchaseInfo.flowId.value}, transactionId=${purchaseInfo.transactionId.value}, mode=${sandbox ? "test" : "live"}`);
  let sweptOnce = false;
  for (; countdown.value > 0; countdown.value -= 1) {
    if (await poll()) return;
    // A buyer who abandoned a checkout and started another arrives here
    // pointed at the second one, so check the first early rather than making
    // them sit through the countdown. After the current checkout has been
    // asked about, though: this purchase answers itself before any other.
    if (!sweptOnce) {
      sweptOnce = true;
      if (await sweepOtherAttempts()) return;
    }
    if (isWaitState()) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (isWaitState()) {
    log(`[license] payment is ${txnStatus.value.status} — switching to slow polling`);
    updateWaitState();
    for (let i = 0; i < PENDING_POLL_LIMIT; i++) {
      await new Promise((resolve) => setTimeout(resolve, PENDING_POLL_INTERVAL_MS));
      if (await poll()) return;
      if (await sweepOtherAttempts()) return;
      updateWaitState();
    }
    log("[license] still waiting after slow polling — leaving the message up");
    return;
  }
  if (await sweepOtherAttempts()) return;
  log("[license] gave up after polling — backend never produced a license for this flowId");
  state.value = State.Delayed;
  title.value = "Order Processing";
});

// "pending" = paid, capture in flight; "in_progress" = customer has not
// completed payment yet (e.g. unscanned QR code). Both keep slow-polling,
// and a flow can move between them, so re-map the state on every poll.
function isWaitState() {
  return ["pending", "in_progress"].includes(txnStatus.value?.status);
}

function updateWaitState() {
  if (txnStatus.value?.status === "pending") {
    state.value = State.PaymentPending;
    title.value = "Confirming Payment";
  } else if (txnStatus.value?.status === "in_progress") {
    state.value = State.PaymentInProgress;
    title.value = "Confirming Payment";
  }
}

// One poll of the backend. Returns true when polling should stop because a
// terminal state (Done / PaymentFailed) was reached.
async function poll() {
  try {
    await loadLicenseKey();
    if (licenseKey.value) {
      log("[license] license received from backend", licenseKey.value);
      // this checkout has been answered, so the sweep above must not offer it
      // back as the outcome of some later one
      purchaseInfo.markDelivered({
        flowId: purchaseInfo.flowId.value,
        transactionId: purchaseInfo.transactionId.value,
      });
      state.value = State.Done;
      title.value = "Thank You";
      kaboom();
      return true;
    }
    if (txnStatus.value?.status === "failed") {
      log("[license] backend reports the payment failed");
      state.value = State.PaymentFailed;
      title.value = "Payment Not Completed";
      return true;
    }
    log(`[license] poll: no license yet (payment status: ${txnStatus.value?.status ?? "unknown"})`);
  } catch (e) {
    console.error("[license] poll error", e);
    lastError = e.message;
  }
  return false;
}

async function loadLicenseKey() {
  const body = await fetchLicense({
    flowId: purchaseInfo.flowId.value,
    transactionId: purchaseInfo.transactionId.value,
  });
  if (body?.object === "transactionStatus") {
    txnStatus.value = body;
  } else {
    licenseKey.value = body;
  }
}

// Ask the backend about one checkout. Either id locates it; the backend
// prefers the transaction id when both are given.
async function fetchLicense(attempt) {
  const endpoint = sandbox
    ? config.pilotmoon.frontendRoot_sandbox
    : config.pilotmoon.frontendRoot;
  const params = new URLSearchParams({ mode: sandbox ? "test" : "live" });
  if (attempt.flowId) {
    params.set("flowId", attempt.flowId);
  }
  if (attempt.transactionId) {
    params.set("transactionId", attempt.transactionId);
  }
  const url = `${endpoint}/store/getLicense?${params}`;
  log(`[license] GET ${url}`);
  const fetchResponse = await fetch(url);
  log(`[license] getLicense responded ${fetchResponse.status}`);
  if (!fetchResponse.ok) {
    throw new Error(`HTTP fetch failed, code ${fetchResponse.status}`);
  }
  return await fetchResponse.json();
}

// Look for the license under the other checkouts opened in this tab, newest
// first. A buyer who leaves a deferred-capture checkout and comes back starts
// a new one, which becomes the current attempt — so the payment that actually
// landed can belong to a checkout this page is not pointed at.
//
// What it must never do is answer the purchase in hand with some other
// purchase, so three things are excluded. Attempts already shown to the buyer
// here: those went nowhere near missing. Free licenses: a free claim delivers
// at once with no capture to wait on, so it can never be the payment we are
// hunting for — but it is very often sitting in the tab, because claiming the
// free year and then upgrading is a path we deliberately offer. And payment
// statuses rather than licenses: what an older checkout is doing says nothing
// the current one's own status doesn't say better.
async function sweepOtherAttempts() {
  for (const attempt of purchaseInfo.recentAttempts()) {
    if (attempt.flowId === purchaseInfo.flowId.value) continue;
    if (attempt.delivered) continue;
    if (!attempt.flowId && !attempt.transactionId) continue;
    try {
      const body = await fetchLicense(attempt);
      if (body?.object !== "licenseKey") continue;
      if (!body.paid) {
        log(`[license] sweep: skipping free license on flowId=${attempt.flowId}`);
        continue;
      }
      log(`[license] license found under an earlier checkout in this tab, flowId=${attempt.flowId}`);
      purchaseInfo.adoptAttempt({
        flowId: body.flowId ?? attempt.flowId,
        transactionId: attempt.transactionId,
      });
      purchaseInfo.markDelivered(attempt);
      licenseKey.value = body;
      state.value = State.Done;
      title.value = "Thank You";
      kaboom();
      return true;
    } catch (e) {
      log("[license] sweep: nothing under this attempt", e.message);
    }
  }
  return false;
}

// How long the buyer is told to expect to wait. One figure for every method
// rather than one each: per Paddle's payment method docs WeChat Pay captures
// within ~10 minutes and Pix, UPI and BLIK typically capture at once with 10
// minutes as the worst case, so ten covers all of them. Overstating is the
// safe direction — a buyer told "a few minutes" who then waits ten concludes
// something has gone wrong, which is the failure this page exists to prevent.
const CONFIRM_TIME = "up to 10 minutes";

// display name for the payment method holding up the license
const paymentMethodNames = {
  wechat_pay: "WeChat Pay",
  pix: "Pix",
  upi: "UPI",
  blik: "BLIK",
  mb_way: "MB WAY",
};

function paymentMethodName() {
  return (
    paymentMethodNames[txnStatus.value?.paymentMethodType] ??
    "Your bank or payment app"
  );
}

// Report license-button clicks to the backend request log, mirroring
// beaconCheckoutEvent in usePaddleBillingCheckout. Diagnostic: lets server
// logs confirm the buyer actually used their key (activated or downloaded),
// not just saw it. sendBeacon so the event still goes out if the click
// navigates away (the activate link leaves the page on some setups).
function beaconLicenseEvent(name) {
  if (!purchaseInfo.flowId.value) return;
  try {
    const endpoint = sandbox
      ? config.pilotmoon.frontendRoot_sandbox
      : config.pilotmoon.frontendRoot;
    const params = new URLSearchParams({
      flowId: purchaseInfo.flowId.value,
      mode: sandbox ? "test" : "live",
      event: name,
    });
    if (purchaseInfo.transactionId.value) {
      params.set("transactionId", purchaseInfo.transactionId.value);
    }
    navigator.sendBeacon(`${endpoint}/store/checkoutEvent?${params}`, "");
  } catch (e) {
    log("[license] beacon failed", e);
  }
}

function registerLink() {
  if (!licenseKey.value?.file?.data) {
    return "";
  }
  const urlSafeData = licenseKey.value?.file?.data
    .replaceAll("+", "-")
    .replaceAll("/", "_");
  return `popclip://register?data=${urlSafeData}`;
}

function licenseFileLink() {
  if (!licenseKey.value?.file?.url) {
    return "";
  }
  return (
    (sandbox ? config.pilotmoon.apiRoot_sandbox : config.pilotmoon.apiRoot) +
    licenseKey.value?.file?.url
  );
}

function licenseFileName() {
  return licenseKey.value?.file?.name || "";
}

// the delivery (payer) email, when it differs from the license email
// (i.e. a separate license owner email was supplied at pre-checkout)
function deliveryEmail() {
  const payer = purchaseInfo.userEmail.value;
  if (!payer) return "";
  if (licenseKey.value?.email && payer.toLowerCase() === licenseKey.value.email.toLowerCase()) {
    return "";
  }
  return payer;
}

function diagnosticInfoString() {
  return `Timestamp: ${timestamp}
Last error: ${lastError}
Purchase flow ID: ${purchaseInfo.flowId.value}
Transaction ID: ${purchaseInfo.transactionId.value}
Payment status: ${txnStatus.value ? `${txnStatus.value.status} (${txnStatus.value.paymentMethodType ?? "unknown method"})` : null}
User email: ${purchaseInfo.userEmail.value}
User country: ${purchaseInfo.userCountry.value}`;
}

function licenseInfoString() {
  if (!licenseKey.value) {
    return "";
  }
  let info = "";
  if (licenseKey.value.name) {
    info += `Name: ${licenseKey.value.name}\n`;
  }
  if (licenseKey.value.email) {
    info += `Email: ${licenseKey.value.email}\n`;
  }
  if (licenseKey.value.description) {
    info += `License type: ${licenseKey.value.description}\n`;
  }
  if (licenseKey.value.expiryDate) {
    info += `Updates until: ${formatDate(licenseKey.value.expiryDate)}\n`;
  }
  if (licenseKey.value.date) {
    info += `Purchase date: ${formatDate(licenseKey.value.date)}\n`;
  }
  if (licenseKey.value.order) {
    info += `Order #: ${licenseKey.value.order}${licenseKey.value.origin ? ` (${licenseKey.value.origin})` : ""}\n`;
  }
  return info;
}
</script>

<template>
  <div>
    <!-- Reached when this browser holds neither a flow id nor a transaction id.
         Says what we can see rather than guessing why: a closed tab is only one
         way to get here, alongside a different tab, a different browser and
         cleared storage. -->
    <div v-if="state === State.NoSession">
      <h1>We cannot find your purchase</h1>
      <p>This browser has no record of a purchase.</p>
      <p>If you bought a license key, we have emailed it to the email address you gave at checkout.</p>
      <p>
        Please check your spam folder, or
        <a
          :href="
            supportMailtoHref({
              subject: 'PopClip Purchase Enquiry',
              body: infoBlock(diagnosticInfoString(), 'Diagnostic Information'),
            })
          "
          >contact support</a
        >.
      </p>
    </div>
    <div v-else-if="state === State.Loading" style="text-align: center; padding-top: 0">
      <VueSpinnerGears color="var(--vp-c-text-2)" size="50" style="display: inline-block" />
      <p>Getting your license key...</p>
      <p v-if="countdown <= 57">Please wait ({{ countdown }})</p>
    </div>
    <div v-else-if="state === State.PaymentPending">
      <h1>Confirming your payment</h1>
      <p>
        Please wait for your license key. It will appear on this page. We will also email it to
        <b>{{ purchaseInfo.userEmail.value || "the email address you gave at checkout" }}</b>.
      </p>
      <p>{{ paymentMethodName() }} may take {{ CONFIRM_TIME }} to confirm your payment.</p>
      <!-- Deliberately worded as running text with no address or icon. While the
           buyer is waiting, a mail icon beside a support address reads as an
           instruction to report a problem rather than a fallback, and waiting is
           what we want them to do. The mailto behind it still carries the
           diagnostics, which are what make the rare real report useful. -->
      <p>
        No email after one hour? Please check your spam folder, or
        <a
          :href="
            supportMailtoHref({
              subject: 'PopClip Purchase Enquiry',
              body: infoBlock(diagnosticInfoString(), 'Diagnostic Information'),
            })
          "
          >contact support</a
        >.
      </p>
    </div>
    <div v-else-if="state === State.PaymentInProgress">
      <h1>Confirming your payment</h1>
      <p>
        Please wait for your license key. It will appear on this page. We will also email it to
        <b>{{ purchaseInfo.userEmail.value || "the email address you gave at checkout" }}</b>.
      </p>
      <p>{{ paymentMethodName() }} may take {{ CONFIRM_TIME }} to confirm your payment.</p>
      <p>If you did not pay, you have not been charged.</p>
      <!-- Deliberately worded as running text with no address or icon. While the
           buyer is waiting, a mail icon beside a support address reads as an
           instruction to report a problem rather than a fallback, and waiting is
           what we want them to do. The mailto behind it still carries the
           diagnostics, which are what make the rare real report useful. -->
      <p>
        No email after one hour? Please check your spam folder, or
        <a
          :href="
            supportMailtoHref({
              subject: 'PopClip Purchase Enquiry',
              body: infoBlock(diagnosticInfoString(), 'Diagnostic Information'),
            })
          "
          >contact support</a
        >.
      </p>
    </div>
    <div v-else-if="state === State.PaymentFailed">
      <h1>Payment not completed</h1>
      <p>Your payment could not be completed, and you have not been charged.</p>
      <p>
        You can try the purchase again, or contact
        <SupportEmailLink subject="PopClip Purchase Problem" :body="infoBlock(diagnosticInfoString(), 'Diagnostic Information')" />
        if you think something's wrong.
      </p>
      <h3>Diagnostic Information</h3>
      <pre
        >{{ diagnosticInfoString() }}
      </pre>
    </div>
    <div v-else-if="state === State.Delayed">
      <!-- Reached after a minute with neither a license nor a payment status, so
           we know less here than anywhere else on this page: the purchase may
           still be settling, or may never have happened. The heading claims only
           what we can see. -->
      <h1>We are still processing your order</h1>
      <p>This is taking a little longer than usual.</p>
      <p>
        We will email your license key to
        <b>{{ purchaseInfo.userEmail.value || "the email address you gave at checkout" }}</b>
        as soon as it is ready. This page has stopped checking, so you do not need to stay here.
      </p>
      <p>
        No email after one hour? Please check your spam folder, or
        <a
          :href="
            supportMailtoHref({
              subject: 'PopClip Purchase Enquiry',
              body: infoBlock(diagnosticInfoString(), 'Diagnostic Information'),
            })
          "
          >contact support</a
        >.
      </p>
      <h3>Diagnostic Information</h3>
      <pre
        >{{ diagnosticInfoString() }}
      </pre>
    </div>
    <div v-else-if="state === State.Done">
      <template v-if="licenseKey.paid">
        <h1>Thank you for your purchase</h1>
        <p>
          Your PopClip license key is ready.
          <button id="party" @click="kaboom">🎉</button>
        </p>
      </template>
      <template v-else>
        <h1>Your license is ready</h1>
        <p>
          Your PopClip license key has been generated.
          <button id="party" @click="kaboom">🎉</button>
        </p>
      </template>
      <h2>Your License Key</h2>
      <div class="license">
        <ul class="details-panel info custom-block">
          <li v-if="licenseKey.name">
            <span class="label">Name: </span>
            <span class="data">{{ licenseKey.name }}</span>
          </li>
          <li>
            <span class="label">Email: </span>
            <span class="data">{{ licenseKey.email }}</span>
          </li>
          <li v-if="licenseKey.description">
            <span class="label">License type: </span>
            <span class="data">{{ licenseKey.description }}</span>
          </li>
          <li v-if="licenseKey.expiryDate">
            <span class="label">Updates until: </span>
            <span class="data">{{ formatDate(licenseKey.expiryDate) }}</span>
          </li>
        </ul>
        <div class="extra-info">
          <span
            ><span class="label">Purchase date: </span> <span class="data">{{ formatDate(licenseKey.date) }}</span></span
          >
          /
          <span
            ><span class="label">Order #: </span> <span class="data">{{ licenseKey.order }} ({{ licenseKey.origin }})</span></span
          >
        </div>
        <AaButton :href="registerLink()" size="big" @click="beaconLicenseEvent('license.activate_clicked')"
          >Activate License</AaButton
        >
      </div>

      <h3>License Key File</h3>

      <p>Download the file to save a reusable copy of your license key. Double-click it to activate PopClip with it.</p>
      <p>
        <DownloadButton size="smaller" theme="outline" :href="licenseFileLink()" text="Download License Key File" :text="licenseFileName()" @click="beaconLicenseEvent('license.download_clicked')"></DownloadButton>
      </p>

      <p>
        A copy of the license key file has been emailed to
        <b>{{ purchaseInfo.userEmail.value }}</b
        >.
      </p>

      <h3>Changes</h3>
      <p>
        If you want to change the registered name or email, please contact&ensp;<SupportEmailLink
          subject="PopClip License Enquiry"
          :body="infoBlock(licenseInfoString(), 'License Details')"
        />.
      </p>
    </div>
  </div>
</template>

<style scoped>
button#party {
  font-size: 1em;
}
div.license {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2em;
}
ul.details-panel {
  list-style-type: none;
  padding: 1em 2em;
}
ul.details-panel li {
  margin: 0;
  line-height: 1.5em;
  font-size: 18px;
  font-family: monospace;
}
ul.details-panel li span.label {
  font-weight: bold;
}
ul.details-panel li span.data {
  font-weight: normal;
}
div.extra-info {
  margin-bottom: 1em;
  color: var(--vp-c-text-2);
  text-align: center;
}
</style>

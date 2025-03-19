<script setup type="ts">
import { onMounted, ref } from "vue";
import { VueSpinnerGears } from "vue3-spinners";
import { usePurchaseInfo } from "./composables/usePurchaseInfo";
import { useTitle } from "@vueuse/core";
import config from "./config/config.json";
import { useDeploymentInfo } from "./composables/useDeploymentInfo";
import { formatDate } from "/src/helpers/formatters";
import { kaboom } from "/src/helpers/confetti";

const purchaseInfo = usePurchaseInfo();
const title = useTitle();
const timestamp = new Date().toISOString();
const licenseKey = ref(null);
const sandbox = useDeploymentInfo().isLocalhost;
const countdown = ref(60);
let lastError = null;

const State = {
  NoSession: Symbol("no-session"),
  Loading: Symbol("loading"),
  Failed: Symbol("failed"),
  Done: Symbol("done"),
};

const state = ref(State.Loading);

onMounted(async () => {
  if (!purchaseInfo.flowId.value) {
    state.value = State.NoSession;
    title.value = "Session Expired";
    return;
  }
  for (; countdown.value > 0; countdown.value -= 1) {
    try {
      await loadLicenseKey();
      if (licenseKey.value) {
        state.value = State.Done;
        kaboom();
        return;
      }
    } catch (e) {
      console.error(e);
      lastError = e.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  state.value = State.Failed;
});

async function loadLicenseKey() {
  const endpoint = sandbox
    ? config.pilotmoon.frontendRoot_sandbox
    : config.pilotmoon.frontendRoot;
  const flowId = purchaseInfo.flowId.value;
  const mode = sandbox ? "test" : "live";
  const fetchResponse = await fetch(
    `${endpoint}/store/getLicense?flowId=${flowId}&mode=${mode}`,
  );
  if (!fetchResponse.ok) {
    throw new Error(`HTTP fetch failed, code ${fetchResponse.status}`);
  }
  licenseKey.value = await fetchResponse.json();
}

function wrapInfo(info, title) {
  return `=== ${title}\n${info.trim()}\n===`;
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

function diagnosticInfoString() {
  return `Timestamp: ${timestamp}
Last error: ${lastError}
Purchase flow ID: ${purchaseInfo.flowId.value}
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
    <div v-if="state === State.NoSession">
      <h1>Session Expired</h1>
      <p>Your session has expired because you closed the browser tab or window.</p>
      <p>If you bought a license key, it will have been sent to to the email address you provided at checkout.</p>
      <p>If you need any help, please contact&ensp;<SupportEmailLink />.</p>
    </div>
    <div v-else-if="state === State.Loading" style="text-align: center; padding-top: 0">
      <VueSpinnerGears color="var(--vp-c-text-2)" size="50" style="display: inline-block" />
      <p>Getting your license key...</p>
      <p v-if="countdown <= 57">Please wait ({{ countdown }})</p>
    </div>
    <div v-else-if="state === State.Failed">
      <h1>Something went wrong</h1>
      <p>
        Please contact
        <SupportEmailLink subject="PopClip Purchase Problem" :body="wrapInfo(diagnosticInfoString(), 'Diagnostic Information')" />.
      </p>
      <h3>Diagnostic Information</h3>
      <pre
        >{{ diagnosticInfoString() }}
      </pre>
    </div>
    <div v-else-if="state === State.Done">
      <h1>Thank you for your purchase</h1>
      <p>
        You have successfully purchased PopClip.
        <button id="party" @click="kaboom">🎉</button> Thank you for your support!
      </p>
      <h2>Your PopClip License Key</h2>
      <div class="license">
        <ul class="details-panel info custom-block">
          <li>
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
        <AaButton :href="registerLink()" size="big">Activate License</AaButton>
      </div>

      <h3>Changes</h3>
      <p>
        If you want to change the registered name or email, please contact&ensp;<SupportEmailLink
          subject="PopClip License Enquiry"
          :body="wrapInfo(licenseInfoString(), 'License Details')"
        />.
      </p>
      <h3>License Key File</h3>
      <p>
        <DownloadButton size="smaller" theme="outline" :href="licenseFileLink()" text="Download License Key File" :text="licenseFileName()"></DownloadButton>
      </p>
      <p>To save a backup of your license key, download the file to your computer. Double-click the file to activate it.</p>
      <p>
        A link to your license key file has also been emailed to
        <b>{{ licenseKey.email }}</b
        >.
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
}
</style>

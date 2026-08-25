import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import config from "../config/config.json";
import { useDeploymentInfo } from "./useDeploymentInfo";
import type { PurchaseAttempt } from "./usePurchaseInfo";
import { usePurchaseInfo } from "./usePurchaseInfo";

// What, if anything, this tab has left hanging from an earlier checkout.
//
// The buy pages ask once on load. On 25 Aug 2026 three buyers paid with
// WeChat Pay, left the page before Paddle captured — which takes about five
// minutes — and emailed support asking where their key was. Two of them
// never opened another checkout, so neither the payment watch nor the status
// page could reach them: both only run somewhere the buyer no longer was.
// A buy page is somewhere they plausibly come back to, and this is what
// notices when they do.
// Methods whose capture happens away from the browser, and which Paddle
// reports as "in_progress" throughout — never "pending" — so an unconfirmed
// payment on one of them may equally be a payment already made. Every other
// method reports "pending" once the money is authorized, so "in_progress"
// there really does mean the buyer did not pay.
const DEFERRED_METHODS = ["wechat_pay", "upi", "pix", "blik", "mb_way"];

export interface OutstandingPurchase {
  // "paying": the money is in hand and nothing has been delivered. The only
  //   kind that stops a new checkout, because it is the only one where
  //   buying again means paying twice.
  // "unconfirmed": a deferred-method payment that Paddle has not confirmed.
  //   Cannot be told apart from one already made, so it is raised without
  //   claiming either way. Never raised for a method that would have said
  //   "pending" if the money were in hand: there, unconfirmed means unpaid,
  //   the buyer knows it, and saying so would only be noise.
  // "undelivered": a paid license exists that this browser has never shown.
  //   Does not stop anything: buying a second license is a real thing people
  //   do, and this one is only here so they can find the first.
  kind: "paying" | "unconfirmed" | "undelivered";
  attempt: PurchaseAttempt;
  method?: string;
}

export const useOutstandingPurchase = createGlobalState(() => {
  const outstanding = ref<OutstandingPurchase | null>(null);
  let asked = false;

  // Only a payment already taken justifies standing between someone and a
  // purchase they are trying to make.
  const blocksCheckout = computed(() => outstanding.value?.kind === "paying");

  async function check() {
    if (asked) return;
    asked = true;
    const purchaseInfo = usePurchaseInfo();
    const sandbox = useDeploymentInfo().isLocalhost;
    const endpoint = sandbox
      ? config.pilotmoon.frontendRoot_sandbox
      : config.pilotmoon.frontendRoot;
    const mode = sandbox ? "test" : "live";
    // Newest first, and nothing already shown to the buyer: a checkout they
    // have seen the outcome of is not outstanding, whatever it did.
    for (const attempt of purchaseInfo.recentAttempts()) {
      if (attempt.delivered) continue;
      if (!attempt.flowId && !attempt.transactionId) continue;
      try {
        const params = new URLSearchParams({ mode });
        if (attempt.flowId) params.set("flowId", attempt.flowId);
        if (attempt.transactionId) {
          params.set("transactionId", attempt.transactionId);
        }
        const res = await fetch(`${endpoint}/store/getLicense?${params}`);
        if (!res.ok) continue; // 404: nothing came of this one
        const body = await res.json();
        if (body?.object === "licenseKey") {
          // A free claim delivers at once and was never at risk of going
          // missing, and claiming the free year before upgrading is a path we
          // offer — so one is often sitting in the tab of someone who is on
          // this page precisely to buy. It must never be raised here.
          if (!body.paid) continue;
          outstanding.value = { kind: "undelivered", attempt };
          return;
        }
        if (body?.object === "transactionStatus") {
          const method = body.paymentMethodType;
          if (body.status === "pending" || body.status === "processing") {
            outstanding.value = { kind: "paying", attempt, method };
            return;
          }
          if (
            body.status === "in_progress" &&
            DEFERRED_METHODS.includes(method)
          ) {
            outstanding.value = { kind: "unconfirmed", attempt, method };
            return;
          }
          // "failed" says the buyer has been charged nothing and knows it.
          // Raising it would only tell someone here to buy that their last
          // try did not work, which they already know.
        }
      } catch (e) {
        // offline, or the backend is unreachable: say nothing at all rather
        // than worry someone who may have no outstanding purchase
        return;
      }
    }
  }

  // Guard for the top of anything that starts a purchase. Returns true when it
  // has taken over, having sent the buyer to the status of the payment already
  // in flight. Call it before raising the pre-checkout dialog, not just before
  // opening the Paddle overlay: asking someone to type their email and only
  // then telling them they have already paid wastes their effort and reads as
  // a fault.
  function interceptPurchase() {
    if (!blocksCheckout.value) return false;
    goToStatus();
    return true;
  }

  // Hand the status page this checkout rather than whatever the tab was last
  // pointed at, and go there.
  function goToStatus() {
    if (!outstanding.value) return;
    usePurchaseInfo().adoptAttempt(outstanding.value.attempt);
    window.location.href = "/purchase-status";
  }

  return { outstanding, blocksCheckout, check, interceptPurchase, goToStatus };
});

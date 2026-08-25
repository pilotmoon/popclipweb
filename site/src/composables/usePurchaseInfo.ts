import { createGlobalState, useSessionStorage } from "@vueuse/core";

// One checkout attempt made in this tab: the flow id minted when the checkout
// opened, and the transaction id Paddle reported for it once it got that far.
//
// Kept as a list because the "current" pair below is a single slot that every
// new checkout overwrites, and a buyer who leaves a checkout and comes back
// starts a new one. Observed in production on 25 Aug 2026: a WeChat Pay buyer
// navigated away while the capture was still in flight, returned, clicked Buy
// again — and the second checkout's first event replaced the transaction id of
// the payment that then actually landed. The license page polled the abandoned
// transaction for three minutes while the real license sat in the database.
// Everything needed to find it was in the tab; it had just been thrown away.
export interface PurchaseAttempt {
  flowId: string;
  transactionId: string | null;
  at: number;
  // set once this checkout's license has been shown to the buyer here, which
  // takes it out of the search below: it is not a purchase that went missing
  delivered?: boolean;
}

// Attempts older than this are ignored. A payment that has not landed in two
// hours is not about to, and a stale attempt that still resolves would show a
// buyer an older license instead of the purchase they just made — the free
// 1-year claim that often precedes an upgrade being the case that matters.
const ATTEMPT_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const ATTEMPT_LIMIT = 5;

export const usePurchaseInfo = createGlobalState(() => {
  // The current checkout: whichever one most recently completed, closed, or
  // reported a transaction. What the license page asks about first.
  const flowId = useSessionStorage<string | null>(
    "popclip-purchase-flow-id",
    null,
  );
  const userEmail = useSessionStorage<string | null>(
    "popclip-purchase-user-email",
    null,
  );
  const userCountry = useSessionStorage<string | null>(
    "popclip-purchase-user-country",
    null,
  );
  const transactionId = useSessionStorage<string | null>(
    "popclip-purchase-transaction-id",
    null,
  );
  // Every checkout opened in this tab, oldest first.
  const attempts = useSessionStorage<PurchaseAttempt[]>(
    "popclip-purchase-attempts",
    [],
  );

  // Record a checkout as it opens, before it has a transaction id.
  function noteAttempt(newFlowId: string | null | undefined) {
    if (!newFlowId) return;
    if (attempts.value.some((a) => a.flowId === newFlowId)) return;
    attempts.value = [
      ...attempts.value,
      { flowId: newFlowId, transactionId: null, at: Date.now() },
    ].slice(-ATTEMPT_LIMIT);
  }

  // Attach the transaction id to an attempt once Paddle reports it. A
  // checkout can report more than one over its life, so the latest wins.
  function noteAttemptTransaction(
    attemptFlowId: string | null | undefined,
    newTransactionId: string | null | undefined,
  ) {
    if (!attemptFlowId || !newTransactionId) return;
    noteAttempt(attemptFlowId);
    attempts.value = attempts.value.map((a) =>
      a.flowId === attemptFlowId
        ? { ...a, transactionId: newTransactionId }
        : a,
    );
  }

  // Note that this checkout's license has been shown to the buyer.
  function markDelivered(attempt: {
    flowId?: string | null;
    transactionId?: string | null;
  }) {
    const key = attempt.flowId ?? attempt.transactionId;
    if (!key) return;
    attempts.value = attempts.value.map((a) =>
      a.flowId === key || (a.transactionId && a.transactionId === key)
        ? { ...a, delivered: true }
        : a,
    );
  }

  // Attempts worth asking the backend about, newest first. Newest first is
  // the resolution order: a license found under a newer attempt must win over
  // one found under an older.
  function recentAttempts(): PurchaseAttempt[] {
    const cutoff = Date.now() - ATTEMPT_MAX_AGE_MS;
    return attempts.value.filter((a) => a.at >= cutoff).reverse();
  }

  // Make an attempt the current one, e.g. after finding its license.
  function adoptAttempt(attempt: {
    flowId?: string | null;
    transactionId?: string | null;
  }) {
    flowId.value = attempt.flowId ?? null;
    transactionId.value = attempt.transactionId ?? null;
  }

  return {
    flowId,
    userEmail,
    userCountry,
    transactionId,
    attempts,
    noteAttempt,
    noteAttemptTransaction,
    markDelivered,
    recentAttempts,
    adoptAttempt,
  };
});

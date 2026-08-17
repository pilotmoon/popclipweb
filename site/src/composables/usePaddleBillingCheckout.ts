import { useData } from "vitepress";
import config from "../config/config.json";
import { loadScript } from "../helpers/loadScript";
import { readParams } from "../helpers/readParams";
import { useDeploymentInfo } from "./useDeploymentInfo";
import { useLogger } from "./useLogger";
import { usePurchaseInfo } from "./usePurchaseInfo";

// Paddle.js v2 installs a global `Paddle` once the script loads.
declare const Paddle: any;

// True when the site should use Paddle Billing for price display and
// checkout: always on localhost (against the Billing sandbox), and in
// production once the cutover flag is set in config.
export function isBillingActive() {
  return config.paddleBilling.enabled || useDeploymentInfo().isLocalhost;
}

export interface OpenBillingCheckoutOptions {
  priceId: string;
  discountCode?: string | null;
  // a codeless discount applied by id (e.g. minted by getOfferCoupon)
  discountId?: string | null;
  email?: string | null;
  // extra fields merged into the checkout customData alongside flow_id
  customData?: Record<string, unknown>;
}

let paddleInitialized = false;

// Paddle Billing checkout setup and post-checkout handling. Counterpart of
// usePaddleCheckout (Classic), which it replaces at the migration cutover.
export function usePaddleBillingCheckout() {
  const { isDark } = useData();
  const log = useLogger();
  const purchaseInfo = usePurchaseInfo();
  const sandbox = useDeploymentInfo().isLocalhost;

  // The flow id is generated locally at checkout open, so on completion we
  // use this rather than parsing it back out of the event payload.
  let currentFlowId: string | null = null;
  // Per-checkout state for the checkout.closed rescue below.
  let paymentInitiated = false;
  let completedFired = false;
  let lastCustomerEmail: string | null = null;
  let lastCustomerCountry: string | null = null;

  async function initPaddle() {
    const token = sandbox
      ? config.paddleBilling.sandboxClientToken
      : config.paddleBilling.clientToken;
    log(`[checkout] initPaddleBilling: sandbox=${sandbox}`);
    await loadScript(config.paddleBilling.script);
    if (paddleInitialized) return;
    if (sandbox) {
      Paddle.Environment.set("sandbox");
      log("[checkout] Paddle environment set to sandbox");
    }
    Paddle.Initialize({
      token,
      eventCallback: (event: any) => {
        log(`[checkout] Paddle event: ${event?.name}`, event?.data);
        if (event?.name?.startsWith?.("checkout.")) {
          beaconCheckoutEvent(event.name, event.data);
          // capture buyer details as soon as any event carries them, so
          // they are known even for checkouts that never reach completion
          if (currentFlowId && event.data?.transaction_id) {
            purchaseInfo.transactionId.value = event.data.transaction_id;
          }
          if (event.data?.customer?.email) {
            lastCustomerEmail = event.data.customer.email;
          }
          const country =
            event.data?.customer?.address?.country_code ??
            event.data?.customer?.address?.countryCode;
          if (country) {
            lastCustomerCountry = country;
          }
          if (event.name === "checkout.payment.initiated") {
            paymentInitiated = true;
          }
          if (event.name === "checkout.closed") {
            checkoutClosed();
          }
        }
        if (event?.name === "checkout.completed") {
          checkoutCompleted(event.data);
        }
      },
    });
    paddleInitialized = true;
    log("[checkout] Paddle.Initialize complete");
  }

  // Report a Paddle.js checkout event to the backend, which records it in
  // the request log. Diagnostic: deferred-capture methods (e.g. WeChat Pay)
  // show customers never arriving at the license page, and these beacons
  // record how far each checkout actually got. sendBeacon so events still
  // go out as the tab is being closed; params in the query string because
  // sendBeacon can't send preflight-free JSON bodies.
  function beaconCheckoutEvent(name: string, data: any) {
    if (!currentFlowId) return;
    try {
      const endpoint = sandbox
        ? config.pilotmoon.frontendRoot_sandbox
        : config.pilotmoon.frontendRoot;
      const params = new URLSearchParams({
        flowId: currentFlowId,
        mode: sandbox ? "test" : "live",
        event: name,
      });
      if (data?.transaction_id) {
        params.set("transactionId", data.transaction_id);
      }
      const method = data?.payment?.method_details?.type;
      if (method) params.set("method", method);
      navigator.sendBeacon(`${endpoint}/store/checkoutEvent?${params}`, "");
    } catch (e) {
      log("[checkout] beacon failed", e);
    }
  }

  // Rescue for deferred-capture payment methods (WeChat Pay, UPI, Pix,
  // BLIK...): Paddle.js does not emit checkout.completed for them even
  // after the payment captures (observed Aug 2026, contrary to Paddle's
  // docs), so buyers close the overlay having seen no confirmation. If a
  // payment was initiated and the checkout closes without completing, send
  // the buyer to the license page anyway — it asks the backend how far the
  // payment actually got and shows the license, a payment-pending notice,
  // or a payment-failed notice accordingly.
  function checkoutClosed() {
    if (!currentFlowId || !paymentInitiated || completedFired) {
      log("[checkout] checkout closed, no rescue needed");
      return;
    }
    purchaseInfo.flowId.value = currentFlowId;
    purchaseInfo.userEmail.value = lastCustomerEmail;
    purchaseInfo.userCountry.value = lastCustomerCountry;
    log(
      `[checkout] closed after payment initiated without completing; redirecting to /purchase-complete, flow_id=${currentFlowId}`,
    );
    window.location.href = "/purchase-complete";
  }

  // On a completed checkout, capture the buyer details and redirect to the
  // license-delivery page, which polls the backend by flow id.
  function checkoutCompleted(data: any) {
    log("[checkout] checkout.completed received", JSON.stringify(data));
    if (!currentFlowId) {
      log("[checkout] ERROR: no flow id for completed checkout");
      return;
    }
    completedFired = true;
    purchaseInfo.flowId.value = currentFlowId;
    // the transaction id lets the license page ask the backend about
    // payment progress (e.g. deferred-capture methods like WeChat Pay)
    purchaseInfo.transactionId.value = data?.transaction_id ?? null;
    purchaseInfo.userEmail.value = data?.customer?.email ?? null;
    purchaseInfo.userCountry.value =
      data?.customer?.address?.country_code ??
      data?.customer?.address?.countryCode ??
      null;
    log(
      `[checkout] flow_id=${currentFlowId}, email=${purchaseInfo.userEmail.value}, country=${purchaseInfo.userCountry.value}`,
    );
    log("[checkout] redirecting to /purchase-complete");
    window.location.href = "/purchase-complete";
  }

  // Open the Paddle overlay for a single item.
  async function openCheckout(options: OpenBillingCheckoutOptions) {
    log("[checkout] openCheckout requested with options", options);
    await initPaddle();
    currentFlowId = window.crypto?.randomUUID();
    paymentInitiated = false;
    completedFired = false;
    lastCustomerEmail = options.email ?? null;
    lastCustomerCountry = null;
    const email = options.email ?? null;
    // #country=XX (the same param that forces displayed prices) also
    // pre-fills the checkout's country, so Paddle localizes currency and
    // payment methods to it rather than geolocating the IP — lets localized
    // checkouts be tested without a VPN. The buyer can still change the
    // country on the first checkout screen.
    const country = readParams().get("country")?.toUpperCase() || null;
    const customer = {
      ...(email ? { email } : {}),
      ...(country ? { address: { countryCode: country } } : {}),
    };
    const checkoutOptions = {
      items: [{ priceId: options.priceId, quantity: 1 }],
      ...(options.discountCode ? { discountCode: options.discountCode } : {}),
      ...(options.discountId ? { discountId: options.discountId } : {}),
      ...(email || country ? { customer } : {}),
      customData: {
        flow_id: currentFlowId,
        ...(options.customData ?? {}),
      },
      settings: {
        displayMode: "overlay",
        theme: isDark.value ? "dark" : "light",
      },
    };
    log(
      `[checkout] opening Paddle overlay: priceId=${options.priceId}, discountCode=${options.discountCode ?? "(none)"}`,
    );
    log("[checkout] customData sent", checkoutOptions.customData);
    Paddle.Checkout.open(checkoutOptions);
  }

  // Initialize Paddle.js without opening a checkout ourselves. Used when
  // the page is visited via a Paddle transaction link (?_ptxn=txn_...):
  // Paddle.js detects the parameter on Initialize and opens the checkout
  // for that transaction automatically.
  async function initForTransactionCheckout() {
    log("[checkout] initializing for a _ptxn transaction link");
    await initPaddle();
  }

  return { openCheckout, initForTransactionCheckout };
}

import { useData } from "vitepress";
import { z } from "zod";
import config from "../config/config.json";
import { loadScript } from "../helpers/loadScript";
import { useDeploymentInfo } from "./useDeploymentInfo";
import { useLogger } from "./useLogger";
import { usePurchaseInfo } from "./usePurchaseInfo";

// Paddle.js installs a global `Paddle` once the script loads.
declare const Paddle: any;

export interface OpenCheckoutOptions {
  product: string | number;
  coupon?: string | null;
  email?: string | null;
  // extra fields merged into the Paddle pass-through alongside flow_id
  passthrough?: Record<string, unknown>;
}

// Shared Paddle checkout setup, pass-through plumbing, and post-checkout handling,
// used by both the Buy page and the MAS upgrade page.
export function usePaddleCheckout() {
  const { isDark } = useData();
  const log = useLogger();
  const purchaseInfo = usePurchaseInfo();
  const sandbox = useDeploymentInfo().isLocalhost;

  async function initPaddle() {
    log(`[checkout] initPaddle: sandbox=${sandbox}, vendor=${config.paddle.vendorId}`);
    await loadScript(config.paddle.script);
    if (sandbox) {
      Paddle.Environment.set("sandbox");
      log("[checkout] Paddle environment set to sandbox");
    }
    Paddle.Setup({
      vendor: config.paddle.vendorId,
      eventCallback: async (args: any) => {
        log(`[checkout] Paddle event: ${args?.event}`, args?.eventData);
        if (args.event === "Checkout.Complete") {
          checkoutComplete(args);
        }
      },
    });
    log("[checkout] Paddle.Setup complete");
  }

  // On a completed checkout, capture the flow id + buyer details and redirect to
  // the license-delivery page.
  function checkoutComplete(args: any) {
    log("[checkout] Checkout.Complete received", args?.eventData);
    const eventData = z
      .object({
        checkout: z.object({ passthrough: z.string().optional() }),
        user: z.object({ email: z.string(), country: z.string() }),
      })
      .safeParse(args.eventData);
    if (!eventData.success) {
      log("[checkout] ERROR parsing checkout data", eventData.error);
      return;
    }
    log("[checkout] raw passthrough string", eventData.data.checkout.passthrough);
    let passthroughObj: unknown;
    try {
      passthroughObj = JSON.parse(eventData.data.checkout.passthrough ?? "");
      log("[checkout] parsed passthrough", passthroughObj);
    } catch (e) {
      log("[checkout] ERROR parsing passthrough JSON", e);
    }
    const parsed = z
      .object({ flow_id: z.string().min(24).optional() })
      .safeParse(passthroughObj);
    if (!parsed.success || !parsed.data.flow_id) {
      log("[checkout] no flow_id in passthrough — cannot link to license", parsed.success ? parsed.data : parsed.error);
      return;
    }
    log(`[checkout] flow_id=${parsed.data.flow_id}, email=${eventData.data.user.email}, country=${eventData.data.user.country}`);
    purchaseInfo.flowId.value = parsed.data.flow_id;
    purchaseInfo.userEmail.value = eventData.data.user.email;
    purchaseInfo.userCountry.value = eventData.data.user.country;
    log("[checkout] redirecting to /purchase-complete");
    window.location.href = "/purchase-complete";
  }

  async function generateRandomKey() {
    return window.crypto?.randomUUID();
  }

  // Open the Paddle overlay. Sandbox fills in the test email/country/postcode.
  // Resolves only once Paddle.Checkout.open() has actually been called, so callers
  // (e.g. a busy-guard) don't clear their "in flight" state before the overlay opens.
  async function openCheckout(options: OpenCheckoutOptions) {
    log("[checkout] openCheckout requested with options", options);
    await initPaddle();
    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        const passthrough = {
          flow_id: await generateRandomKey(),
          ...(options.passthrough ?? {}),
        };
        const checkoutOptions = {
          // In sandbox, always use the sandbox product — it's the one wired up for license
          // fulfilment in the Paddle sandbox dashboard, so it triggers the generateLicense webhook.
          // (Backend test coupons target this same id.) Live uses the real product id.
          product: sandbox ? config.paddle.sandboxProductId : options.product,
          coupon: options.coupon ?? null,
          email: sandbox ? "pcweb.testing@pilotmoon.com" : (options.email ?? null),
          country: sandbox ? "GB" : null,
          postcode: sandbox ? "SW1 1AA" : null,
          allowQuantity: false,
          displayModeTheme: isDark.value ? "dark" : "light",
          passthrough: JSON.stringify(passthrough),
        };
        // Log the resolved product/coupon/passthrough actually handed to Paddle (not just the input).
        log(`[checkout] opening Paddle overlay: product=${checkoutOptions.product}, coupon=${checkoutOptions.coupon ?? "(none)"}`);
        log("[checkout] passthrough sent", passthrough);
        Paddle.Checkout.open(checkoutOptions);
        resolve();
      }, 200);
    });
  }

  return { openCheckout };
}

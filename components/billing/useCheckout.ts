"use client";

import { useCallback, useRef, useState } from "react";
import { createCheckout, verifyPayment, type Balance, type CheckoutSession, type VerifyPayload } from "@/lib/billing/client";
import { BILLING_DEMO } from "@/lib/billing/mode";
import type { Currency } from "@/lib/billing/config";

export type CheckoutState =
  | { step: "idle" }
  | { step: "creating"; productId: string }
  | { step: "paying"; productId: string; session: CheckoutSession }
  | { step: "verifying"; productId: string }
  | { step: "success"; productId: string; balance: Balance; added: number }
  | { step: "failed"; productId: string; reason: string }
  | { step: "cancelled"; productId: string }
  | { step: "pending"; productId: string };

type RazorpayCtor = new (opts: Record<string, unknown>) => { open: () => void; on: (ev: string, cb: (r: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Couldn't load Razorpay. Check your connection and try again."));
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Runs one purchase: create the order/subscription on the server, open Razorpay Checkout,
 * then have the server verify the signature and credit the account.
 * In demo builds, `demoSheet` is used instead of Razorpay (see DemoCheckoutSheet).
 */
export function useCheckout(opts: { prefill?: { name?: string; email?: string }; onBalance?: (b: Balance) => void }) {
  const [state, setState] = useState<CheckoutState>({ step: "idle" });
  const demoResolver = useRef<((r: { ok: true; payload: VerifyPayload } | { ok: false; reason: string } | { ok: null }) => void) | null>(null);

  const start = useCallback(
    async (kind: "pack" | "plan", productId: string, currency: Currency, credits: number) => {
      setState({ step: "creating", productId });
      let session: CheckoutSession;
      try {
        session = await createCheckout({ kind, productId, currency });
      } catch (e) {
        return setState({ step: "failed", productId, reason: (e as Error).message || "We couldn't start the payment." });
      }
      setState({ step: "paying", productId, session });

      const finish = async (payload: VerifyPayload) => {
        setState({ step: "verifying", productId });
        try {
          const balance = await verifyPayment({ ...payload, kind, productId, currency });
          opts.onBalance?.(balance);
          setState({ step: "success", productId, balance, added: credits });
        } catch {
          // Payment may have gone through; the webhook will credit the account.
          setState({ step: "pending", productId });
        }
      };

      if (BILLING_DEMO) {
        const result = await new Promise<{ ok: true; payload: VerifyPayload } | { ok: false; reason: string } | { ok: null }>((resolve) => (demoResolver.current = resolve));
        demoResolver.current = null;
        if (result.ok === true) return finish(result.payload);
        if (result.ok === false) return setState({ step: "failed", productId, reason: result.reason });
        return setState({ step: "cancelled", productId });
      }

      try {
        await loadRazorpay();
      } catch (e) {
        return setState({ step: "failed", productId, reason: (e as Error).message });
      }
      const rzp = new window.Razorpay!({
        key: session.keyId,
        amount: session.amount,
        currency: session.currency,
        name: session.name,
        description: session.description,
        order_id: session.orderId,
        subscription_id: session.subscriptionId,
        prefill: { ...opts.prefill, ...session.prefill },
        theme: { color: "#4f6ef7" },
        handler: (resp: VerifyPayload) => void finish(resp),
        modal: { ondismiss: () => setState((s) => (s.step === "paying" ? { step: "cancelled", productId } : s)), confirm_close: true },
      });
      rzp.on("payment.failed", (r) => setState({ step: "failed", productId, reason: r.error?.description || "The payment was declined." }));
      rzp.open();
    },
    [opts],
  );

  const demo = {
    pay: () => demoResolver.current?.({ ok: true, payload: { razorpay_payment_id: `pay_demo_${Date.now()}`, razorpay_signature: "demo", razorpay_order_id: "order_demo" } }),
    fail: () => demoResolver.current?.({ ok: false, reason: "Your bank declined the payment (simulated)." }),
    cancel: () => demoResolver.current?.({ ok: null }),
  };

  return { state, start, reset: () => setState({ step: "idle" }), demo };
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Loader2, Lock, RotateCcw, X, XCircle } from "lucide-react";

import { PACKS, PLANS, formatPrice, type Currency } from "@/lib/billing/config";
import { BILLING_DEMO } from "@/lib/billing/mode";
import type { Balance } from "@/lib/billing/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import PlanPicker, { CurrencyToggle, type Selection } from "@/components/billing/PlanPicker";
import { useCheckout, type CheckoutState } from "@/components/billing/useCheckout";

export type PaywallRequest = {
  /** Credits the action needs. Omit for a plain "get credits" dialog. */
  needed?: number;
  /** What the user was trying to do, for the headline. */
  context?: string;
  /** Pre-select an option (e.g. from the billing page). */
  preselect?: Selection;
  currency?: Currency;
  resolve: (ok: boolean) => void;
};

const guessCurrency = (): Currency => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Calcutta" || navigator.language.endsWith("IN") ? "INR" : "USD";
  } catch {
    return "INR";
  }
};

export default function Paywall({
  request,
  balance,
  user,
  onBalance,
  onClose,
}: {
  request: PaywallRequest | null;
  balance: Balance;
  user: { name: string; email: string };
  onBalance: (b: Balance) => void;
  onClose: (ok: boolean) => void;
}) {
  const open = !!request;
  const needed = request?.needed || 0;
  const missing = Math.max(0, needed - balance.credits);
  const [currency, setCurrency] = useState<Currency>("INR");
  const defaultSel = useMemo<Selection>(() => {
    const pack = PACKS.find((p) => p.credits >= missing) || PACKS[1];
    return { kind: "pack", id: missing > 0 ? pack.id : "starter" };
  }, [missing]);
  const [selected, setSelected] = useState<Selection>(defaultSel);
  const checkout = useCheckout({ prefill: { name: user.name, email: user.email }, onBalance });

  useEffect(() => {
    if (open) {
      setSelected(request?.preselect || defaultSel);
      setCurrency(request?.currency || guessCurrency());
      checkout.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const product = selected.kind === "pack" ? PACKS.find((p) => p.id === selected.id)! : PLANS.find((p) => p.id === selected.id)!;
  const credits = "credits" in product ? product.credits : product.creditsPerPeriod;
  const price = formatPrice(product.price[currency], currency);
  const busy = checkout.state.step === "creating" || checkout.state.step === "verifying";
  const showStatus = !["idle", "creating"].includes(checkout.state.step) && !(checkout.state.step === "paying" && !BILLING_DEMO);
  const succeeded = checkout.state.step === "success" && checkout.state.balance.credits >= needed;

  const close = () => {
    if (busy) return;
    onClose(checkout.state.step === "success" && (checkout.state.balance.credits >= needed || !needed));
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[oklch(0.1_0.04_270/0.6)] backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby="paywall-desc"
          onInteractOutside={(e) => busy && e.preventDefault()}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[94dvh] overflow-y-auto rounded-t-[28px] border bg-popover shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4 sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[calc(100%-2rem)] sm:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] sm:data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Close
            disabled={busy}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 grid size-9 cursor-pointer place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>

          {showStatus ? (
            <Status
              state={checkout.state}
              needed={needed}
              context={request?.context}
              demo={checkout.demo}
              price={price}
              productName={`${product.name}${selected.kind === "plan" ? " subscription" : " pack"}`}
              credits={credits}
              onRetry={() => checkout.reset()}
              onDone={() => onClose(succeeded || (checkout.state.step === "success" && !needed))}
            />
          ) : (
            <div className="p-5 sm:p-8">
              <div className="pr-10">
                <DialogPrimitive.Title className="type-page">{missing > 0 ? `You need ${missing} more credits` : "Get more credits"}</DialogPrimitive.Title>
                <DialogPrimitive.Description id="paywall-desc" className="mt-2 max-w-xl text-[15px] text-muted-foreground">
                  {missing > 0
                    ? `${request?.context || "This interview"} uses ${needed} credits and you have ${balance.credits}. Top up once, or subscribe for a monthly allowance.`
                    : "Credits pay for interviews: 2 per question. Packs never expire."}
                </DialogPrimitive.Description>
              </div>

              {needed > 0 && (
                <div className="mt-5 max-w-md">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Balance <span className="num font-medium text-foreground">{balance.credits}</span>
                    </span>
                    <span>
                      Needed <span className="num font-medium text-foreground">{needed}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={needed} aria-valuenow={Math.min(balance.credits, needed)} aria-label="Credits you have toward this interview">
                    <div className="h-full rounded-full bg-warning" style={{ width: `${Math.min(100, (balance.credits / needed) * 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-6 mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Choose an option</p>
                <CurrencyToggle value={currency} onChange={setCurrency} />
              </div>
              <PlanPicker currency={currency} selected={selected} onSelect={setSelected} needed={missing} compact />

              <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col gap-3 border-t bg-popover/95 px-5 pt-4 pb-1 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:px-0 sm:pb-0">
                <div className="text-sm">
                  <p>
                    <span className="font-medium">{product.name}</span>
                    {selected.kind === "plan" ? ` subscription, ${credits.toLocaleString()} credits each ${(product as (typeof PLANS)[number]).interval}` : `, ${credits} credits`}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3" /> Secured by Razorpay. UPI, cards, netbanking and wallets.{" "}
                    <Link href="/refunds" className="underline underline-offset-2 hover:text-foreground">
                      Refund policy
                    </Link>
                  </p>
                </div>
                <Button
                  variant="brand"
                  size="lg"
                  disabled={busy}
                  onClick={() => checkout.start(selected.kind, selected.id, currency, credits)}
                  className="min-w-44"
                >
                  {checkout.state.step === "creating" ? <Loader2 className="animate-spin" /> : null}
                  {selected.kind === "plan" ? `Subscribe for ${price}` : `Pay ${price}`}
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Status({
  state,
  needed,
  context,
  demo,
  price,
  productName,
  credits,
  onRetry,
  onDone,
}: {
  state: CheckoutState;
  needed: number;
  context?: string;
  demo: { pay: () => void; fail: () => void; cancel: () => void };
  price: string;
  productName: string;
  credits: number;
  onRetry: () => void;
  onDone: () => void;
}) {
  if (state.step === "paying" && BILLING_DEMO) return <DemoCheckoutSheet price={price} productName={productName} demo={demo} />;

  const view = {
    verifying: { icon: <Loader2 className="size-7 animate-spin text-brand" />, tone: "bg-brand-soft", title: "Confirming your payment", body: "This takes a few seconds. Please keep this window open." },
    success:
      state.step === "success"
        ? {
            icon: <CheckCircle2 className="size-7 text-success" />,
            tone: "bg-success-soft",
            title: `${state.added.toLocaleString()} credits added`,
            body: `Your balance is ${state.balance.credits.toLocaleString()} credits.${needed && state.balance.credits >= needed ? ` That covers ${context ? context.toLowerCase() : "this interview"}.` : ""} A receipt is in Billing.`,
          }
        : null,
    failed: state.step === "failed" ? { icon: <XCircle className="size-7 text-destructive" />, tone: "bg-destructive-soft", title: "Payment didn't go through", body: `${state.reason} You haven't been charged. Try again or pick another method.` } : null,
    cancelled: { icon: <AlertTriangle className="size-7 text-warning" />, tone: "bg-warning-soft", title: "Payment cancelled", body: "You closed the payment window, so nothing was charged." },
    pending: { icon: <Clock3 className="size-7 text-warning" />, tone: "bg-warning-soft", title: "We're still confirming this payment", body: "If money left your account, credits arrive within a few minutes. You don't need to pay again." },
  }[state.step as "verifying" | "success" | "failed" | "cancelled" | "pending"];
  if (!view) return null;

  return (
    <div className="flex flex-col items-center px-6 py-12 text-center sm:px-10" role="status" aria-live="polite">
      <span className={cn("grid size-16 place-items-center rounded-full", view.tone)}>{view.icon}</span>
      <DialogPrimitive.Title className="type-page mt-6">{view.title}</DialogPrimitive.Title>
      <DialogPrimitive.Description className="mt-2 max-w-md text-[15px] text-muted-foreground">{view.body}</DialogPrimitive.Description>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        {state.step === "success" && (
          <Button variant="brand" size="lg" onClick={onDone}>
            {needed ? "Continue to interview" : "Done"} <ArrowRight />
          </Button>
        )}
        {(state.step === "failed" || state.step === "cancelled") && (
          <>
            <Button variant="brand" size="lg" onClick={onRetry}>
              <RotateCcw /> Try again
            </Button>
            <Button variant="outline" size="lg" onClick={onDone}>
              Not now
            </Button>
          </>
        )}
        {state.step === "pending" && (
          <Button size="lg" onClick={onDone}>
            Close
          </Button>
        )}
      </div>
      {state.step === "success" && <p className="sr-only">{credits} credits added</p>}
    </div>
  );
}

/** Demo builds only: stands in for the Razorpay window so every outcome can be reviewed. */
function DemoCheckoutSheet({ price, productName, demo }: { price: string; productName: string; demo: { pay: () => void; fail: () => void; cancel: () => void } }) {
  const [method, setMethod] = useState("upi");
  return (
    <div className="p-5 sm:p-8">
      <div className="mx-auto max-w-md">
        <p className="mb-3 flex items-center justify-center gap-2 rounded-full border border-dashed px-3 py-1.5 text-center text-xs text-muted-foreground">
          Demo checkout. In the live app this is Razorpay&apos;s own window.
        </p>
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <DialogPrimitive.Title className="font-semibold">Examify</DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground">{productName}</DialogPrimitive.Description>
            </div>
            <span className="num text-xl font-semibold">{price}</span>
          </div>
          <div role="radiogroup" aria-label="Payment method" className="grid gap-2 p-4">
            {[
              ["upi", "UPI", "Google Pay, PhonePe, Paytm"],
              ["card", "Card", "Visa, Mastercard, RuPay"],
              ["netbanking", "Netbanking", "All major banks"],
            ].map(([id, label, sub]) => (
              <button
                key={id}
                role="radio"
                aria-checked={method === id}
                onClick={() => setMethod(id)}
                className={cn("flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors", method === id ? "border-[var(--magic-2)] bg-brand-soft" : "hover:bg-accent")}
              >
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">{sub}</span>
                </span>
                <span className={cn("size-4 rounded-full border-2", method === id ? "border-[5px] border-[var(--magic-2)]" : "border-input")} />
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 border-t p-4">
            <Button variant="brand" size="lg" onClick={demo.pay}>
              Pay {price}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={demo.fail}>
                Simulate failure
              </Button>
              <Button variant="ghost" onClick={demo.cancel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, CalendarClock, Coins, Download, Loader2, ReceiptText, Sparkles } from "lucide-react";

import { cancelSubscription, getLedger, getPayments } from "@/lib/billing/client";
import { PACKS, PLANS, formatMinor, interviewCost, planById, planName, type Currency } from "@/lib/billing/config";
import { BILLING_DEMO } from "@/lib/billing/mode";
import { cn } from "@/lib/utils";
import { useBilling } from "@/components/billing/BillingProvider";
import PlanPicker, { CurrencyToggle, type Selection } from "@/components/billing/PlanPicker";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const REASON: Record<CreditTxn["reason"], string> = {
  signup_bonus: "Welcome credits",
  pack_purchase: "Credit pack",
  plan_renewal: "Subscription credits",
  interview: "Interview",
  admin_grant: "Added by support",
  refund: "Refund",
  expiry: "Expired",
};

export default function BillingPage() {
  const { balance, setBalance, openPaywall } = useBilling();
  const [ledger, setLedger] = useState<CreditTxn[] | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[] | null>(null);
  const [currency, setCurrency] = useState<Currency>("INR");
  const [selected, setSelected] = useState<Selection>({ kind: "plan", id: "pro_month" });
  const [cancelling, setCancelling] = useState(false);
  const plan = planById(balance.plan);

  const load = () => {
    getLedger().then(setLedger).catch(() => setLedger([]));
    getPayments().then(setPayments).catch(() => setPayments([]));
  };
  useEffect(load, [balance.credits, balance.plan]);

  const used30 = (ledger || []).filter((t) => t.delta < 0 && dayjs().diff(t.createdAt, "day") <= 30).reduce((s, t) => s - t.delta, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Billing" description="Your credits, plan and receipts." />

      {/* Summary */}
      <section className="grid gap-5 lg:grid-cols-12">
        <div className="card-magic flex flex-col justify-between gap-6 rounded-[28px] p-6 sm:p-8 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-sans text-sm font-medium text-muted-foreground">Credit balance</h2>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="num text-6xl font-semibold tracking-tight">{balance.credits.toLocaleString()}</span>
                <span className="text-muted-foreground">credits</span>
              </p>
              <p className="mt-2 text-sm">
                Enough for about <span className="font-semibold">{Math.floor(balance.credits / interviewCost(5))}</span> five-question interviews.{" "}
                <span className="text-muted-foreground">{used30} used in the last 30 days.</span>
              </p>
            </div>
            <Button variant="brand" size="lg" onClick={() => openPaywall()}>
              <Coins /> Get credits
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Interviews use {interviewCost(1)} credits per question. Pack credits never expire.</p>
        </div>

        <div className="flex flex-col rounded-[28px] border bg-card p-6 sm:p-8 lg:col-span-5">
          <h2 className="font-sans text-sm font-medium text-muted-foreground">Plan</h2>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-[-0.02em]">
            {plan ? <Sparkles className="size-5 text-brand-strong" /> : null}
            {planName(balance.plan)}
            {balance.planStatus === "cancelled" && <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">Ends soon</span>}
          </p>
          {plan ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.creditsPerPeriod.toLocaleString()} credits each {plan.interval}.{" "}
                {balance.planRenewsAt && (
                  <>
                    {balance.planStatus === "cancelled" ? "Ends" : "Renews"} on <span className="font-medium text-foreground">{dayjs(balance.planRenewsAt).format("D MMM YYYY")}</span>.
                  </>
                )}
              </p>
              <div className="mt-auto pt-6">
                {balance.planStatus !== "cancelled" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">Cancel subscription</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Cancel your Pro subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You keep Pro and your current credits until {balance.planRenewsAt ? dayjs(balance.planRenewsAt).format("D MMM YYYY") : "the end of this period"}. You won&apos;t be charged again.
                      </AlertDialogDescription>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Pro</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            setCancelling(true);
                            try {
                              setBalance(await cancelSubscription());
                              toast.success("Subscription cancelled. Pro stays active until the end of this period.");
                            } catch {
                              toast.error("We couldn't cancel right now. Try again.");
                            } finally {
                              setCancelling(false);
                            }
                          }}
                        >
                          {cancelling && <Loader2 className="animate-spin" />} Cancel subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button variant="brand" onClick={() => openPaywall()}>
                    Resubscribe
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">Pay as you go with packs, or subscribe to Pro for {PLANS[0].creditsPerPeriod} credits a month.</p>
              <div className="mt-auto pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelected({ kind: "plan", id: "pro_month" });
                    document.getElementById("buy")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  See Pro
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Buy */}
      <section id="buy" aria-labelledby="buy-h" className="scroll-mt-24 rounded-[28px] border bg-card p-5 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="buy-h" className="text-xl font-semibold tracking-[-0.02em]">
            Buy credits or subscribe
          </h2>
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </div>
        <PlanPicker currency={currency} selected={selected} onSelect={setSelected} />
        <div className="mt-6 flex justify-end">
          <Button variant="brand" size="lg" onClick={() => openPaywall({ preselect: selected, currency })}>
            Continue to payment
          </Button>
        </div>
      </section>

      {/* History */}
      <section aria-labelledby="hist" className="rounded-[28px] border bg-card p-5 sm:p-8">
        <h2 id="hist" className="sr-only">
          History
        </h2>
        <Tabs defaultValue="credits">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="credits" className="flex-1 sm:flex-none">Credit history</TabsTrigger>
            <TabsTrigger value="receipts" className="flex-1 sm:flex-none">Receipts</TabsTrigger>
          </TabsList>
          <TabsContent value="credits" className="mt-5">
            {!ledger ? (
              <RowsSkeleton />
            ) : (
              <ul className="divide-y">
                {ledger.map((t) => (
                  <li key={t.id} className="flex items-center gap-4 py-3.5">
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", t.delta > 0 ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground")}>
                      {t.delta > 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{REASON[t.reason]}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {t.note ? `${t.note}, ` : ""}
                        {dayjs(t.createdAt).format("D MMM YYYY, h:mm A")}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className={cn("num block text-sm font-semibold", t.delta > 0 ? "text-success" : "")}>{t.delta > 0 ? `+${t.delta}` : t.delta}</span>
                      <span className="num block text-xs text-muted-foreground">Balance {t.balanceAfter}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="receipts" className="mt-5">
            {!payments ? (
              <RowsSkeleton />
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <ReceiptText className="size-6 text-muted-foreground" />
                <p className="mt-3 font-medium">No payments yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Receipts for packs and subscriptions appear here.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {payments.map((p) => {
                  const prod = p.kind === "pack" ? PACKS.find((x) => x.id === p.productId) : PLANS.find((x) => x.id === p.productId);
                  return (
                    <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong">
                        {p.kind === "plan" ? <CalendarClock className="size-4" /> : <Coins className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">
                          {prod?.name || p.productId} {p.kind === "plan" ? "subscription" : "pack"}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {dayjs(p.createdAt).format("D MMM YYYY")}, {p.credits} credits, {p.method?.toUpperCase()}
                        </span>
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", p.status === "captured" ? "bg-success-soft text-success" : p.status === "failed" ? "bg-destructive-soft text-destructive" : "bg-warning-soft text-warning")}>
                        {p.status === "captured" ? "Paid" : p.status === "failed" ? "Failed" : p.status === "refunded" ? "Refunded" : "Pending"}
                      </span>
                      <span className="num w-20 text-right text-sm font-semibold">{formatMinor(p.amount, p.currency)}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Download receipt"
                        disabled={p.status !== "captured"}
                        onClick={() => (p.receiptUrl ? window.open(p.receiptUrl, "_blank") : toast.info(BILLING_DEMO ? "Receipts download from Razorpay in the live app." : "Your receipt is being prepared. Try again in a minute."))}
                      >
                        <Download />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function RowsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 rounded-xl" />
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { Coins, Plus } from "lucide-react";
import { useBilling } from "@/components/billing/BillingProvider";
import { LOW_BALANCE_THRESHOLD, interviewCost, planName } from "@/lib/billing/config";
import { cn } from "@/lib/utils";

/** Sidebar card: balance, plan, how many interviews that buys, and a top-up button. */
export function CreditCard() {
  const { balance, openPaywall } = useBilling();
  const low = balance.credits < LOW_BALANCE_THRESHOLD;
  const interviews = Math.floor(balance.credits / interviewCost(5));
  return (
    <div className={cn("rounded-2xl border p-3", low ? "border-[color-mix(in_oklab,var(--warning)_40%,var(--border))] bg-warning-soft" : "bg-card")}>
      <div className="flex items-center justify-between gap-2">
        <Link href="/billing" className="group min-w-0 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
          <span className="flex items-baseline gap-1.5">
            <Coins className={cn("size-4 self-center", low ? "text-warning" : "text-brand-strong")} />
            <span className="num text-lg font-semibold">{balance.credits.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">credits</span>
          </span>
          <span className="block truncate text-xs text-muted-foreground group-hover:text-foreground">
            {planName(balance.plan)} plan · {low ? "Running low" : `About ${interviews} interview${interviews === 1 ? "" : "s"}`}
          </span>
        </Link>
        <button
          onClick={() => openPaywall()}
          aria-label="Get more credits"
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-magic text-white transition-[scale] hover:scale-105"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Compact chip for the phone header and icon rail. */
export function CreditChip({ className }: { className?: string }) {
  const { balance } = useBilling();
  const low = balance.credits < LOW_BALANCE_THRESHOLD;
  return (
    <Link
      href="/billing"
      aria-label={`${balance.credits} credits. Open billing`}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition-colors hover:bg-accent",
        low ? "border-[color-mix(in_oklab,var(--warning)_45%,var(--border))] bg-warning-soft text-warning" : "bg-card",
        className,
      )}
    >
      <Coins className="size-3.5" />
      <span className="num">{balance.credits}</span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";

import { PACKS, PLANS, formatPrice, interviewCost, type Currency } from "@/lib/billing/config";
import { cn } from "@/lib/utils";

export type Selection = { kind: "pack" | "plan"; id: string };

/** Currency switch shared by every pricing surface. */
export function CurrencyToggle({ value, onChange }: { value: Currency; onChange: (c: Currency) => void }) {
  return (
    <div role="radiogroup" aria-label="Currency" className="inline-flex rounded-full border bg-surface p-0.5 text-xs font-medium">
      {(["INR", "USD"] as const).map((c) => (
        <button
          key={c}
          role="radio"
          aria-checked={value === c}
          onClick={() => onChange(c)}
          className={cn("h-7 cursor-pointer rounded-full px-3 transition-colors", value === c ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          {c === "INR" ? "₹ INR" : "$ USD"}
        </button>
      ))}
    </div>
  );
}

/**
 * Packs on the left, the Pro subscription on the right. Selecting is separate from paying,
 * so the footer can show one clear "Pay ₹X" action.
 */
export default function PlanPicker({
  currency,
  selected,
  onSelect,
  needed = 0,
  compact = false,
  publicHref,
}: {
  currency: Currency;
  selected: Selection;
  onSelect: (s: Selection) => void;
  needed?: number;
  compact?: boolean;
  /** Public pricing: cards link here instead of selecting. */
  publicHref?: string;
}) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const plan = PLANS.find((p) => p.interval === interval)!;
  const perMonth = interval === "year" ? plan.price[currency] / 12 : plan.price[currency];
  const isSel = (k: Selection["kind"], id: string) => selected.kind === k && selected.id === id;
  // A plain function (not a component) so selecting doesn't remount the element and drop focus.
  const wrap = (key: string, k: Selection["kind"], id: string, label: string, className: string, children: React.ReactNode) =>
    publicHref ? (
      <Link key={key} href={publicHref} className={className} aria-label={label}>
        {children}
      </Link>
    ) : (
      <button key={key} type="button" role="radio" aria-checked={isSel(k, id)} aria-label={label} onClick={() => onSelect({ kind: k, id })} className={className}>
        {children}
      </button>
    );

  return (
    <div className={cn("grid gap-4", compact ? "md:grid-cols-[1fr_1fr]" : "lg:grid-cols-[1.1fr_1fr]")}>
      {/* Packs */}
      <div role={publicHref ? undefined : "radiogroup"} aria-label="Credit packs" className="flex flex-col gap-2.5">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Zap className="size-4 text-brand-strong" /> Credit packs <span className="font-normal text-muted-foreground">One-time, never expire</span>
        </p>
        {PACKS.map((p) => {
          const covers = needed > 0 && p.credits >= needed;
          const sel = isSel("pack", p.id);
          return (
            wrap(
              p.id,
              "pack",
              p.id,
              `${p.name}: ${p.credits} credits for ${formatPrice(p.price[currency], currency)}`,
              cn(
                "group flex cursor-pointer items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-[border-color,box-shadow,background-color] outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                sel ? "border-[var(--magic-2)] bg-[color-mix(in_oklab,var(--magic-2)_8%,var(--card))] shadow-[0_0_0_1px_var(--magic-2)]" : "hover:border-[color-mix(in_oklab,var(--magic-2)_45%,var(--border))]",
              ),
              <>
              {!publicHref && (
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors", sel ? "border-[var(--magic-2)] bg-[var(--magic-2)] text-white" : "border-input")}>
                  {sel && <Check className="size-3" strokeWidth={3} />}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  {p.id === "try" && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-strong">Lowest price</span>}
                  {p.highlight && <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">Popular</span>}
                  {covers && !p.highlight && p.id !== "try" && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium">Covers it</span>}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  <span className="num font-medium text-foreground">{p.credits}</span> credits · {p.blurb}
                </span>
              </span>
              <span className="num text-right text-lg font-semibold tracking-tight">{formatPrice(p.price[currency], currency)}</span>
              </>,
            )
          );
        })}
      </div>

      {/* Subscription */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="size-4 text-brand-strong" /> Subscription
          </p>
          <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full border bg-surface p-0.5 text-xs font-medium">
            {(["month", "year"] as const).map((iv) => (
              <button
                key={iv}
                role="radio"
                aria-checked={interval === iv}
                onClick={() => {
                  setInterval(iv);
                  if (selected.kind === "plan") onSelect({ kind: "plan", id: PLANS.find((p) => p.interval === iv)!.id });
                }}
                className={cn("h-7 cursor-pointer rounded-full px-3 transition-colors", interval === iv ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                {iv === "month" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
        </div>
        {wrap(
          plan.id,
          "plan",
          plan.id,
          `${plan.name}: ${plan.creditsPerPeriod} credits per ${plan.interval} for ${formatPrice(plan.price[currency], currency)}`,
          cn(
            "card-magic flex flex-1 cursor-pointer flex-col rounded-2xl p-5 text-left transition-shadow outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
            isSel("plan", plan.id) ? "shadow-[0_0_0_2px_var(--magic-2),0_18px_40px_-22px_var(--magic-2)]" : "hover:shadow-[0_18px_40px_-22px_var(--magic-2)]",
          ),
          <>
          <span className="flex items-start justify-between gap-3">
            <span>
              <span className="flex items-center gap-2">
                <span className="text-lg font-semibold tracking-[-0.01em]">{plan.name}</span>
                <span className="rounded-full bg-magic px-2 py-0.5 text-[11px] font-medium text-white">{interval === "year" ? "2 months free" : "Best value"}</span>
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{plan.blurb}</span>
            </span>
            {!publicHref && (
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", isSel("plan", plan.id) ? "border-[var(--magic-2)] bg-[var(--magic-2)] text-white" : "border-input")}>
                {isSel("plan", plan.id) && <Check className="size-3" strokeWidth={3} />}
              </span>
            )}
          </span>
          <span className="mt-4 flex items-baseline gap-1.5">
            <span className="num text-3xl font-semibold tracking-tight">{formatPrice(plan.price[currency], currency)}</span>
            <span className="text-sm text-muted-foreground">/ {plan.interval}</span>
          </span>
          {interval === "year" && <span className="text-xs text-muted-foreground">{formatPrice(Math.round(perMonth * 100) / 100, currency)} a month, billed yearly</span>}
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" /> {f}
              </li>
            ))}
          </ul>
          </>,
        )}
      </div>
      {!compact && (
        <p className="text-xs text-muted-foreground lg:col-span-2">
          A 5-question interview uses {interviewCost(5)} credits ({interviewCost(1)} per question). New accounts start with 20 free credits.
        </p>
      )}
    </div>
  );
}

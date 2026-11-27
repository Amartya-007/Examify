"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { AlertTriangle, ArrowRight, Coins, CreditCard, IndianRupee, RefreshCw, Users } from "lucide-react";

import { adminOverview, adminPayments, adminUsers, type AdminOverview, type AdminUserRow } from "@/lib/billing/client";
import { PACKS, formatMinor, planName } from "@/lib/billing/config";
import { cn } from "@/lib/utils";
import { BarChart, HBars, LineChart } from "@/components/admin/Charts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const inr = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
const RANGES = [7, 30, 90] as const;

export default function Overview() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState(false);
  const [low, setLow] = useState<{ rows: AdminUserRow[]; total: number } | null>(null);
  const [failed, setFailed] = useState<{ rows: PaymentRecord[]; total: number } | null>(null);
  const [recent, setRecent] = useState<PaymentRecord[] | null>(null);

  const load = () => {
    setError(false);
    setData(null);
    adminOverview(range).then(setData).catch(() => setError(true));
  };
  useEffect(load, [range]);
  useEffect(() => {
    adminUsers({ status: "low", sort: "credits:asc", pageSize: 5 }).then((r) => setLow({ rows: r.rows, total: r.total })).catch(() => setLow({ rows: [], total: 0 }));
    adminPayments({ status: "failed", pageSize: 4 }).then((r) => setFailed({ rows: r.rows, total: r.total })).catch(() => setFailed({ rows: [], total: 0 }));
    adminPayments({ pageSize: 6 }).then((r) => setRecent(r.rows)).catch(() => setRecent([]));
  }, []);

  const t = data?.totals;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-page">Overview</h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">Revenue, subscriptions and credit usage for the last {range} days.</p>
        </div>
        <div role="radiogroup" aria-label="Date range" className="inline-flex self-start rounded-xl border bg-card p-1 sm:self-auto">
          {RANGES.map((r) => (
            <button
              key={r}
              role="radio"
              aria-checked={range === r}
              onClick={() => setRange(r)}
              className={cn("h-8 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors", range === r ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div role="alert" className="flex flex-col items-center rounded-[24px] border border-dashed py-14 text-center">
          <AlertTriangle className="size-6 text-destructive" />
          <p className="mt-3 font-medium">We couldn&apos;t load the dashboard</p>
          <p className="mt-1 text-sm text-muted-foreground">Check the admin API, then try again.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={load}>
            <RefreshCw /> Retry
          </Button>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi icon={IndianRupee} label="Revenue" value={t ? inr(t.revenueINR) : null} sub={t ? `MRR ${inr(t.mrrINR)}` : ""} />
            <Kpi icon={CreditCard} label="Active subscriptions" value={t ? t.activeSubscriptions.toLocaleString() : null} sub={t ? `${t.payingUsers} paying users in total` : ""} />
            <Kpi icon={Users} label="Users" value={t ? t.users.toLocaleString() : null} sub={t ? `${t.newUsers} new, ${t.activeUsers} active this week` : ""} />
            <Kpi icon={Coins} label="Credits used" value={t ? t.creditsUsed.toLocaleString() : null} sub={t ? `${t.creditsSold.toLocaleString()} sold, ${t.creditsOutstanding.toLocaleString()} unspent` : ""} />
          </section>

          <section className="grid gap-4 xl:grid-cols-12">
            <Panel title="Revenue per day" note={t ? `${(t.conversionRate * 100).toFixed(1)}% of users have paid` : undefined} className="xl:col-span-8">
              {data ? <BarChart data={data.daily} k="revenue" label="Revenue" format={inr} /> : <Skeleton className="h-[220px]" />}
            </Panel>
            <Panel title="Users by plan" className="xl:col-span-4">
              {data ? <HBars rows={data.planMix.map((p) => ({ label: planName(p.plan), value: p.users }))} /> : <Skeleton className="h-40" />}
            </Panel>
            <Panel title="Credits" note="Separate scales: one yearly plan can add thousands of credits in a day" className="xl:col-span-8">
              {data ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-sm font-medium">Used per day</p>
                    <LineChart data={data.daily} series={[{ k: "creditsUsed", label: "Credits used", color: "var(--series-b)" }]} />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium">Sold per day</p>
                    <LineChart data={data.daily} series={[{ k: "creditsSold", label: "Credits sold", color: "var(--series-a)" }]} />
                  </div>
                </div>
              ) : (
                <Skeleton className="h-[240px]" />
              )}
            </Panel>
            <Panel title="Credit packs" note={`Last ${range} days`} className="xl:col-span-4">
              {data ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">Pack</th>
                      <th className="pb-2 text-right font-medium">Sold</th>
                      <th className="pb-2 text-right font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.topPacks.map((p) => (
                      <tr key={p.productId}>
                        <td className="py-2.5">{PACKS.find((x) => x.id === p.productId)?.name}</td>
                        <td className="num py-2.5 text-right">{p.purchases}</td>
                        <td className="num py-2.5 text-right font-medium">{inr(p.revenueINR)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Skeleton className="h-32" />
              )}
            </Panel>
          </section>

          {/* Needs attention */}
          <section className="grid gap-4 lg:grid-cols-3">
            <Panel
              title="Can't afford an interview"
              note={low ? `${low.total} users under 10 credits` : undefined}
              action={
                <Link href="/admin/users?status=low" className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-brand-strong hover:underline">
                  View all <ArrowRight className="size-3.5" />
                </Link>
              }
            >
              <MiniList
                rows={low?.rows.map((u) => ({ key: u.id, href: `/admin/users?user=${u.id}`, title: u.name, sub: `${planName(u.plan)} plan`, right: `${u.credits} credits`, tone: "warning" as const }))}
                empty="Everyone can afford an interview."
              />
            </Panel>
            <Panel
              title="Failed payments"
              note={failed ? `${failed.total} in total` : undefined}
              action={
                <Link href="/admin/payments?status=failed" className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-brand-strong hover:underline">
                  View all <ArrowRight className="size-3.5" />
                </Link>
              }
            >
              <MiniList
                rows={failed?.rows.map((p) => ({ key: p.id, href: `/admin/users?user=${p.userId}`, title: p.userName || p.userId, sub: dayjs(p.createdAt).format("D MMM, h:mm A"), right: formatMinor(p.amount, p.currency), tone: "destructive" as const }))}
                empty="No failed payments."
              />
            </Panel>
            <Panel
              title="Latest payments"
              action={
                <Link href="/admin/payments" className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-brand-strong hover:underline">
                  View all <ArrowRight className="size-3.5" />
                </Link>
              }
            >
              <MiniList
                rows={recent?.map((p) => ({ key: p.id, href: `/admin/users?user=${p.userId}`, title: p.userName || p.userId, sub: `${dayjs(p.createdAt).format("D MMM")}, ${p.credits} credits`, right: formatMinor(p.amount, p.currency), tone: p.status === "captured" ? ("success" as const) : ("destructive" as const) }))}
                empty="No payments yet."
              />
            </Panel>
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string | null; sub: string }) {
  return (
    <div className="rounded-[20px] border bg-card p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" /> {label}
      </p>
      {value === null ? <Skeleton className="mt-3 h-8 w-24" /> : <p className="num mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>}
      <p className="mt-1 min-h-4 truncate text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function Panel({ title, note, action, className, children }: { title: string; note?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("min-w-0 rounded-[24px] border bg-card p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-base font-semibold">{title}</h2>
          {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MiniList({ rows, empty }: { rows?: { key: string; href: string; title: string; sub: string; right: string; tone: "warning" | "destructive" | "success" }[]; empty: string }) {
  if (!rows)
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  if (!rows.length) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="-mx-2 flex flex-col">
      {rows.map((r) => (
        <li key={r.key}>
          <Link href={r.href} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{r.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>
            </span>
            <span className={cn("num shrink-0 text-sm font-semibold", r.tone === "warning" && "text-warning", r.tone === "destructive" && "text-destructive")}>{r.right}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

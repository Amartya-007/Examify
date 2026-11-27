"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Download, Search, SearchX } from "lucide-react";

import { adminPayments } from "@/lib/billing/client";
import { PACKS, PLANS, formatMinor } from "@/lib/billing/config";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/components/admin/csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const STATUSES = [
  ["all", "All"],
  ["captured", "Paid"],
  ["failed", "Failed"],
  ["refunded", "Refunded"],
  ["pending", "Pending"],
] as const;
const productName = (p: PaymentRecord) => (p.kind === "pack" ? `${PACKS.find((x) => x.id === p.productId)?.name || p.productId} pack` : `${PLANS.find((x) => x.id === p.productId)?.name || p.productId}`);

export default function PaymentsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const status = sp.get("status") || "all";
  const q = sp.get("q") || "";
  const page = Number(sp.get("page") || 1);
  const [data, setData] = useState<{ rows: PaymentRecord[]; total: number; page: number; pageSize: number } | null>(null);
  const [totals, setTotals] = useState<{ inr: number; usd: number; count: number } | null>(null);
  const [search, setSearch] = useState(q);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) => (v === null || v === "" || v === "all" ? next.delete(k) : next.set(k, v)));
      if (!("page" in patch)) next.delete("page");
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [pathname, router, sp],
  );

  useEffect(() => {
    setData(null);
    adminPayments({ status, q, page }).then(setData).catch(() => setData({ rows: [], total: 0, page, pageSize: 15 }));
  }, [status, q, page]);
  useEffect(() => {
    adminPayments({ status: "captured", pageSize: 100000 })
      .then((r) => setTotals({ inr: r.rows.filter((p) => p.currency === "INR").reduce((s, p) => s + p.amount, 0), usd: r.rows.filter((p) => p.currency === "USD").reduce((s, p) => s + p.amount, 0), count: r.total }))
      .catch(() => setTotals(null));
  }, []);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const exportCsv = async () => {
    const all = await adminPayments({ status, q, page: 1, pageSize: 100000 });
    downloadCsv(
      `examify-payments-${dayjs().format("YYYY-MM-DD")}.csv`,
      ["date", "user_id", "user_name", "user_email", "product", "kind", "credits", "amount", "currency", "status", "method", "razorpay_payment_id", "razorpay_order_id", "razorpay_subscription_id"],
      all.rows.map((p) => [p.createdAt, p.userId, p.userName, p.userEmail, p.productId, p.kind, p.credits, (p.amount / 100).toFixed(2), p.currency, p.status, p.method, p.razorpayPaymentId, p.razorpayOrderId, p.razorpaySubscriptionId]),
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-page">Payments</h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">
            {totals ? (
              <>
                <span className="num font-medium text-foreground">{formatMinor(totals.inr, "INR")}</span>
                {totals.usd > 0 && (
                  <>
                    {" "}
                    and <span className="num font-medium text-foreground">{formatMinor(totals.usd, "USD")}</span>
                  </>
                )}{" "}
                collected across {totals.count} successful payments.
              </>
            ) : (
              "Every Razorpay payment, newest first."
            )}
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!data?.total}>
          <Download /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div role="tablist" aria-label="Status" className="scrollbar-none flex gap-1 overflow-x-auto">
          {STATUSES.map(([v, l]) => (
            <button
              key={v}
              role="tab"
              aria-selected={status === v}
              onClick={() => setParams({ status: v })}
              className={cn("h-9 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground", status === v && "bg-accent text-foreground")}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="relative md:ml-auto md:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              clearTimeout(debounce.current);
              debounce.current = setTimeout(() => setParams({ q: e.target.value }), 250);
            }}
            placeholder="Search user or Razorpay ID"
            aria-label="Search payments"
            className="h-10 pl-9 text-sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-surface/60 text-left text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Date</th>
              <th scope="col" className="px-4 py-3 font-medium">User</th>
              <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Product</th>
              <th scope="col" className="hidden px-4 py-3 text-right font-medium sm:table-cell">Credits</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Amount</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="hidden px-4 py-3 font-medium xl:table-cell">Razorpay ID</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!data
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-8" />
                    </td>
                  </tr>
                ))
              : data.rows.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-accent/50">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{dayjs(p.createdAt).format("D MMM, h:mm A")}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users?user=${p.userId}`} className="font-medium hover:underline">
                        {p.userName || p.userId}
                      </Link>
                      <span className="block max-w-[200px] truncate text-xs text-muted-foreground">{p.userEmail}</span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {productName(p)}
                      <span className="block text-xs text-muted-foreground">{p.method?.toUpperCase()}</span>
                    </td>
                    <td className="num hidden px-4 py-3 text-right sm:table-cell">{p.credits.toLocaleString()}</td>
                    <td className="num px-4 py-3 text-right font-semibold">{formatMinor(p.amount, p.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", p.status === "captured" ? "bg-success-soft text-success" : p.status === "failed" ? "bg-destructive-soft text-destructive" : "bg-warning-soft text-warning")}>
                        {STATUSES.find(([v]) => v === p.status)?.[1]}
                      </span>
                    </td>
                    <td className="num hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">{p.razorpayPaymentId || p.razorpayOrderId || "–"}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        {data && data.rows.length === 0 && (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <SearchX className="size-6 text-muted-foreground" />
            <p className="mt-3 font-medium">No payments match</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another status or search.</p>
          </div>
        )}
      </div>

      {data && data.total > data.pageSize && (
        <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {(page - 1) * data.pageSize + 1}–{Math.min(page * data.pageSize, data.total)} of {data.total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" aria-label="Previous page" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })}>
              <ChevronLeft />
            </Button>
            <span className="num px-2">
              {page} / {pages}
            </span>
            <Button variant="outline" size="icon-sm" aria-label="Next page" disabled={page >= pages} onClick={() => setParams({ page: String(page + 1) })}>
              <ChevronRight />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search, SearchX } from "lucide-react";

import { adminUsers, type AdminUserRow, type AdminUsersPage } from "@/lib/billing/client";
import { LOW_BALANCE_THRESHOLD, planName } from "@/lib/billing/config";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/components/admin/csv";
import UserSheet from "@/components/admin/UserSheet";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

dayjs.extend(relativeTime);
const inr = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const COLS: { key: keyof AdminUserRow; label: string; numeric?: boolean; className?: string }[] = [
  { key: "name", label: "User" },
  { key: "plan", label: "Plan", className: "hidden md:table-cell" },
  { key: "credits", label: "Balance", numeric: true },
  { key: "creditsPurchased", label: "Bought", numeric: true, className: "hidden lg:table-cell" },
  { key: "creditsUsed", label: "Used", numeric: true, className: "hidden sm:table-cell" },
  { key: "interviews", label: "Interviews", numeric: true, className: "hidden xl:table-cell" },
  { key: "revenueINR", label: "Revenue", numeric: true, className: "hidden lg:table-cell" },
  { key: "lastActiveAt", label: "Last active", className: "hidden xl:table-cell" },
];

export default function UsersTable() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const plan = sp.get("plan") || "all";
  const status = sp.get("status") || "all";
  const sort = sp.get("sort") || "createdAt:desc";
  const page = Number(sp.get("page") || 1);
  const openUser = sp.get("user");
  const [data, setData] = useState<AdminUsersPage | null>(null);
  const [search, setSearch] = useState(q);
  const [exporting, setExporting] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) => (v === null || v === "" || v === "all" ? next.delete(k) : next.set(k, v)));
      if (!("page" in patch) && !("user" in patch)) next.delete("page");
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [pathname, router, sp],
  );

  useEffect(() => {
    setData(null);
    adminUsers({ q, plan, status, sort, page }).then(setData).catch(() => setData({ rows: [], total: 0, page, pageSize: 12 }));
  }, [q, plan, status, sort, page]);

  const [sortKey, sortDir] = sort.split(":");
  const toggleSort = (k: string) => setParams({ sort: `${k}:${sortKey === k && sortDir === "desc" ? "asc" : "desc"}` });
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await adminUsers({ q, plan, status, sort, page: 1, pageSize: 10000 });
      downloadCsv(
        `examify-users-${dayjs().format("YYYY-MM-DD")}.csv`,
        ["id", "name", "email", "plan", "plan_status", "credits_balance", "credits_bought", "credits_used", "interviews", "revenue_inr", "joined", "last_active", "status"],
        all.rows.map((u) => [u.id, u.name, u.email, u.plan, u.planStatus, u.credits, u.creditsPurchased, u.creditsUsed, u.interviews, u.revenueINR, u.createdAt, u.lastActiveAt, u.status]),
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-page">Users</h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">{data ? `${data.total.toLocaleString()} ${data.total === 1 ? "user" : "users"}` : "Loading users"} with plan, balance and credit usage.</p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={exporting || !data?.total}>
          <Download /> Export CSV
        </Button>
      </div>

      {/* Filters: one row */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              clearTimeout(debounce.current);
              debounce.current = setTimeout(() => setParams({ q: e.target.value }), 250);
            }}
            placeholder="Search name, email or ID"
            aria-label="Search users"
            className="h-10 pl-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={plan} onValueChange={(v) => setParams({ plan: v })}>
            <SelectTrigger aria-label="Plan" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Any paid plan</SelectItem>
              <SelectItem value="pro_month">Pro monthly</SelectItem>
              <SelectItem value="pro_year">Pro yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setParams({ status: v })}>
            <SelectTrigger aria-label="Status" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="low">Low balance</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(q || plan !== "all" || status !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setParams({ q: null, plan: null, status: null });
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-[20px] border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-surface/60">
            <tr>
              {COLS.map((c) => {
                const active = sortKey === c.key;
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"} className={cn("px-4 py-2.5 font-medium text-muted-foreground", c.numeric ? "text-right" : "text-left", c.className)}>
                    <button onClick={() => toggleSort(c.key)} className={cn("inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-md hover:text-foreground", active && "text-foreground")}>
                      {c.label}
                      {active && (sortDir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y">
            {!data
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={COLS.length} className="px-4 py-3">
                      <Skeleton className="h-9" />
                    </td>
                  </tr>
                ))
              : data.rows.map((u) => {
                  const low = (u.credits || 0) < LOW_BALANCE_THRESHOLD;
                  const usedPct = u.creditsPurchased ? Math.min(100, (u.creditsUsed / u.creditsPurchased) * 100) : 0;
                  return (
                    <tr
                      key={u.id}
                      tabIndex={0}
                      onClick={() => setParams({ user: u.id })}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setParams({ user: u.id }))}
                      aria-label={`Open ${u.name}`}
                      className="cursor-pointer transition-colors outline-none hover:bg-accent/60 focus-visible:bg-accent"
                    >
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">{initials(u.name)}</AvatarFallback>
                          </Avatar>
                          <span className="min-w-0">
                            <span className="flex items-center gap-2 font-medium">
                              <span className="truncate">{u.name}</span>
                              {u.status === "suspended" && <span className="rounded-full bg-destructive-soft px-1.5 py-0.5 text-[10px] font-medium text-destructive">Suspended</span>}
                              {u.role === "admin" && <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium">Admin</span>}
                            </span>
                            <span className="block max-w-[220px] truncate text-xs text-muted-foreground">{u.email}</span>
                          </span>
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", u.plan === "free" ? "bg-secondary" : "bg-brand-soft text-brand-strong")}>{planName(u.plan)}</span>
                        {u.planStatus === "cancelled" && <span className="ml-1.5 text-xs text-warning">Cancelled</span>}
                      </td>
                      <td className={cn("num px-4 py-3 text-right font-semibold", low && "text-warning")}>{(u.credits || 0).toLocaleString()}</td>
                      <td className="num hidden px-4 py-3 text-right lg:table-cell">{u.creditsPurchased.toLocaleString()}</td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell">
                        <span className="num block">{u.creditsUsed.toLocaleString()}</span>
                        <span className="ml-auto mt-1 block h-1 w-16 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                          <span className="block h-full rounded-full" style={{ width: `${usedPct}%`, background: "var(--series-b)" }} />
                        </span>
                      </td>
                      <td className="num hidden px-4 py-3 text-right xl:table-cell">{u.interviews}</td>
                      <td className="num hidden px-4 py-3 text-right lg:table-cell">{u.revenueINR ? inr(u.revenueINR) : "–"}</td>
                      <td className="hidden px-4 py-3 text-muted-foreground xl:table-cell">{dayjs(u.lastActiveAt).fromNow()}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {data && data.rows.length === 0 && (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <SearchX className="size-6 text-muted-foreground" />
            <p className="mt-3 font-medium">No users match</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search or clear the filters.</p>
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

      <UserSheet
        userId={openUser}
        onClose={() => setParams({ user: null })}
        onChanged={(u) => setData((d) => (d ? { ...d, rows: d.rows.map((r) => (r.id === u.id ? { ...r, ...u } : r)) } : d))}
      />
    </div>
  );
}

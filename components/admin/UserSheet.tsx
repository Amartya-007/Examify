"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Ban, Check, Copy, Loader2, Minus, Plus, RotateCcw, X } from "lucide-react";

import { adminGrantCredits, adminSetStatus, adminUser, type AdminUserDetail, type AdminUserRow } from "@/lib/billing/client";
import { formatMinor, planName } from "@/lib/billing/config";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  pack_purchase: "Pack purchase",
  plan_renewal: "Subscription credits",
  interview: "Interviews",
  admin_grant: "Admin adjustment",
  refund: "Refund",
  expiry: "Expired",
};
const inr = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function UserSheet({ userId, onClose, onChanged }: { userId: string | null; onClose: () => void; onChanged: (u: AdminUserRow) => void }) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; note?: string }>({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDetail(null);
    setAmount("");
    setNote("");
    setErrors({});
    if (userId) adminUser(userId).then(setDetail).catch(() => toast.error("We couldn't load this user."));
  }, [userId]);

  const u = detail?.user;

  const adjust = async () => {
    const n = Math.round(Number(amount));
    const errs: typeof errors = {};
    if (!n || n <= 0) errs.amount = "Enter a whole number above 0.";
    else if (mode === "remove" && u && n > (u.credits || 0)) errs.amount = `They only have ${u.credits} credits.`;
    if (note.trim().length < 3) errs.note = "Add a short reason. It's saved in their credit history.";
    setErrors(errs);
    if (Object.keys(errs).length || !u) return;
    setSaving(true);
    try {
      const delta = mode === "add" ? n : -n;
      const updated = await adminGrantCredits(u.id, delta, note.trim());
      const row: CreditTxn = { id: `adj${Date.now()}`, userId: u.id, delta, reason: "admin_grant", note: note.trim(), balanceAfter: updated.credits || 0, createdAt: new Date().toISOString() };
      setDetail((d) => (d ? { ...d, user: { ...d.user, credits: updated.credits }, ledger: [row, ...d.ledger] } : d));
      onChanged({ ...u, credits: updated.credits });
      toast.success(`${mode === "add" ? "Added" : "Removed"} ${n} credits ${mode === "add" ? "to" : "from"} ${u.name}`);
      setAmount("");
      setNote("");
    } catch {
      toast.error("We couldn't change the balance. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!u) return;
    const next = u.status === "suspended" ? "active" : "suspended";
    try {
      await adminSetStatus(u.id, next);
      setDetail((d) => (d ? { ...d, user: { ...d.user, status: next } } : d));
      onChanged({ ...u, status: next });
      toast.success(next === "suspended" ? `${u.name} is suspended` : `${u.name} is active again`);
    } catch {
      toast.error("We couldn't update this account.");
    }
  };

  return (
    <DialogPrimitive.Root open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[oklch(0.1_0.04_270/0.45)] backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l bg-popover shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right-8"
        >
          <div className="flex items-center justify-between border-b px-5 py-3">
            <DialogPrimitive.Title className="text-sm font-medium text-muted-foreground">User details</DialogPrimitive.Title>
            <DialogPrimitive.Close aria-label="Close" className="grid size-9 cursor-pointer place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {!u ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-14" />
                <Skeleton className="h-24" />
                <Skeleton className="h-48" />
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <Avatar className="size-14">
                    <AvatarFallback className="text-lg">{initials(u.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-[-0.02em]">
                      {u.name}
                      {u.status === "suspended" && <span className="rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-medium text-destructive">Suspended</span>}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(u.id).catch(() => {});
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                      }}
                      className="mt-1 inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground"
                    >
                      <span className="num">{u.id}</span> {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["Balance", (u.credits || 0).toLocaleString()],
                    ["Bought", u.creditsPurchased.toLocaleString()],
                    ["Used", u.creditsUsed.toLocaleString()],
                    ["Revenue", u.revenueINR ? inr(u.revenueINR) : "–"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-surface p-3">
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="num mt-0.5 text-lg font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm text-muted-foreground">
                  {planName(u.plan)} plan
                  {u.plan !== "free" && u.planRenewsAt && `, ${u.planStatus === "cancelled" ? "ends" : "renews"} ${dayjs(u.planRenewsAt).format("D MMM YYYY")}`}. Joined {dayjs(u.createdAt).format("D MMM YYYY")}. {u.interviews} interviews.
                </p>

                {/* Adjust credits */}
                <section className="mt-6 rounded-2xl border p-4" aria-labelledby="adj">
                  <h3 id="adj" className="font-sans text-sm font-semibold">
                    Adjust credits
                  </h3>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <div role="radiogroup" aria-label="Add or remove" className="inline-flex h-10 shrink-0 rounded-lg border bg-surface p-0.5">
                      {(["add", "remove"] as const).map((m) => (
                        <button
                          key={m}
                          role="radio"
                          aria-checked={mode === m}
                          onClick={() => setMode(m)}
                          className={cn("inline-flex cursor-pointer items-center gap-1 rounded-md px-3 text-sm font-medium", mode === m ? "bg-card shadow-sm" : "text-muted-foreground")}
                        >
                          {m === "add" ? <Plus className="size-3.5" /> : <Minus className="size-3.5" />} {m === "add" ? "Add" : "Remove"}
                        </button>
                      ))}
                    </div>
                    <div className="sm:w-28">
                      <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} placeholder="50" aria-label="Credits" aria-invalid={!!errors.amount} className="h-10" />
                    </div>
                    <div className="flex-1">
                      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason, e.g. refund for dropped call" aria-label="Reason" aria-invalid={!!errors.note} className="h-10" />
                    </div>
                  </div>
                  {(errors.amount || errors.note) && (
                    <p role="alert" className="mt-2 text-[13px] text-destructive">
                      {errors.amount || errors.note}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      New balance: <span className="num font-medium text-foreground">{Math.max(0, (u.credits || 0) + (mode === "add" ? 1 : -1) * (Number(amount) || 0))}</span>
                    </p>
                    <Button size="sm" onClick={adjust} disabled={saving}>
                      {saving && <Loader2 className="animate-spin" />} {mode === "add" ? "Add credits" : "Remove credits"}
                    </Button>
                  </div>
                </section>

                <Tabs defaultValue="credits" className="mt-6">
                  <TabsList>
                    <TabsTrigger value="credits">Credit history</TabsTrigger>
                    <TabsTrigger value="payments">Payments {detail!.payments.length > 0 && <span className="num text-xs text-muted-foreground">{detail!.payments.length}</span>}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="credits" className="mt-3">
                    <ul className="divide-y">
                      {detail!.ledger.map((t) => (
                        <li key={t.id} className="flex items-center gap-3 py-3 text-sm">
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium">{REASON[t.reason]}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {t.note ? `${t.note}, ` : ""}
                              {dayjs(t.createdAt).format("D MMM YYYY")}
                            </span>
                          </span>
                          <span className={cn("num font-semibold", t.delta > 0 ? "text-success" : "")}>{t.delta > 0 ? `+${t.delta}` : t.delta}</span>
                          <span className="num w-16 text-right text-xs text-muted-foreground">{t.balanceAfter}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="payments" className="mt-3">
                    {detail!.payments.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">No payments from this user.</p>
                    ) : (
                      <ul className="divide-y">
                        {detail!.payments.map((p) => (
                          <li key={p.id} className="flex items-center gap-3 py-3 text-sm">
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium">
                                {p.productId} {p.kind === "plan" ? "subscription" : "pack"}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {dayjs(p.createdAt).format("D MMM YYYY, h:mm A")}, {p.method?.toUpperCase()}, <span className="num">{p.razorpayPaymentId || p.razorpayOrderId}</span>
                              </span>
                            </span>
                            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", p.status === "captured" ? "bg-success-soft text-success" : p.status === "failed" ? "bg-destructive-soft text-destructive" : "bg-warning-soft text-warning")}>
                              {p.status === "captured" ? "Paid" : p.status[0].toUpperCase() + p.status.slice(1)}
                            </span>
                            <span className="num w-16 text-right font-semibold">{formatMinor(p.amount, p.currency)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          {u && (
            <div className="flex justify-end border-t px-5 py-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant={u.status === "suspended" ? "outline" : "ghost"} size="sm" className={cn(u.status !== "suspended" && "text-destructive hover:bg-destructive-soft hover:text-destructive")}>
                    {u.status === "suspended" ? <RotateCcw /> : <Ban />} {u.status === "suspended" ? "Reactivate account" : "Suspend account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>{u.status === "suspended" ? `Reactivate ${u.name}?` : `Suspend ${u.name}?`}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {u.status === "suspended" ? "They'll be able to sign in and take interviews again." : "They won't be able to sign in or start interviews. Their data and credits are kept, and you can reactivate them later."}
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={toggleStatus} className={cn(u.status === "suspended" && "bg-primary text-primary-foreground hover:bg-primary/90")}>
                      {u.status === "suspended" ? "Reactivate" : "Suspend"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

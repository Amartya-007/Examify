"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getBalance, type Balance } from "@/lib/billing/client";
import { interviewCost } from "@/lib/billing/config";
import Paywall, { type PaywallRequest } from "@/components/billing/Paywall";

type Ctx = {
  balance: Balance;
  loading: boolean;
  refresh: () => Promise<Balance>;
  setBalance: (b: Balance) => void;
  /** Opens the payment wall. Resolves true if the user ended up with enough credits. */
  openPaywall: (req?: Omit<PaywallRequest, "resolve">) => Promise<boolean>;
  /** True if the balance covers an interview with this many questions; otherwise opens the paywall. */
  ensureCredits: (questions: number, context?: string) => Promise<boolean>;
};

const BillingContext = createContext<Ctx | null>(null);

export function useBilling() {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error("useBilling must be used inside <BillingProvider>");
  return ctx;
}

export default function BillingProvider({ initial, user, children }: { initial: Balance; user: { name: string; email: string }; children: React.ReactNode }) {
  const [balance, setBalance] = useState<Balance>(initial);
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<PaywallRequest | null>(null);
  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const b = await getBalance();
      setBalance(b);
      return b;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
    const on = () => refresh().catch(() => {});
    window.addEventListener("examify:billing", on);
    window.addEventListener("focus", on);
    return () => {
      window.removeEventListener("examify:billing", on);
      window.removeEventListener("focus", on);
    };
  }, [refresh]);

  const openPaywall = useCallback(
    (req: Omit<PaywallRequest, "resolve"> = {}) => new Promise<boolean>((resolve) => setRequest({ ...req, resolve })),
    [],
  );

  const ensureCredits = useCallback(
    async (questions: number, context?: string) => {
      const needed = interviewCost(questions);
      const current = (await refresh().catch(() => balanceRef.current)).credits;
      if (current >= needed) return true;
      return openPaywall({ needed, context });
    },
    [openPaywall, refresh],
  );

  const value = useMemo(() => ({ balance, loading, refresh, setBalance, openPaywall, ensureCredits }), [balance, loading, refresh, openPaywall, ensureCredits]);

  return (
    <BillingContext.Provider value={value}>
      {children}
      <Paywall
        request={request}
        balance={balance}
        user={user}
        onBalance={setBalance}
        onClose={(ok) => {
          request?.resolve(ok);
          setRequest(null);
        }}
      />
    </BillingContext.Provider>
  );
}

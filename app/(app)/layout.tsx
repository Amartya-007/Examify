import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbacksByUserId, getInterviewsByUserId } from "@/lib/actions/general.action";
import AppShell from "@/components/app/AppShell";
import BillingProvider from "@/components/billing/BillingProvider";
import { initialBalance } from "@/lib/billing/initial";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboarded) redirect("/onboarding");
  const [feedbacks, interviews] = await Promise.all([getFeedbacksByUserId(user.id), getInterviewsByUserId(user.id)]);
  const roleOf = new Map((interviews || []).map((i) => [i.id, i.role]));
  return (
    <BillingProvider initial={initialBalance(user)} user={{ name: user.name, email: user.email }}>
    <AppShell
      user={{ id: user.id, name: user.name, email: user.email, profileURL: user.profileURL, role: user.role }}
      reports={feedbacks.slice(0, 4).map((f) => ({ id: f.id, interviewId: f.interviewId, role: roleOf.get(f.interviewId) || "Interview", score: f.totalScore, createdAt: f.createdAt }))}
      interviews={(interviews || []).map((i) => ({ id: i.id, role: i.role, level: i.level, scored: feedbacks.some((f) => f.interviewId === i.id) }))}
    >
      {children}
    </AppShell>
    </BillingProvider>
  );
}

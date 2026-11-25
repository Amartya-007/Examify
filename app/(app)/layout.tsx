import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbacksByUserId } from "@/lib/actions/general.action";
import AppShell from "@/components/app/AppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboarded) redirect("/onboarding");
  const recent = (await getFeedbacksByUserId(user.id)).slice(0, 5);
  return (
    <AppShell
      user={{ id: user.id, name: user.name, email: user.email, profileURL: user.profileURL }}
      notifications={recent.map((f) => ({ id: f.id, interviewId: f.interviewId, score: f.totalScore, createdAt: f.createdAt }))}
    >
      {children}
    </AppShell>
  );
}

import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { initialBalance } from "@/lib/billing/initial";
import BillingProvider from "@/components/billing/BillingProvider";

export default async function FocusLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return (
    <BillingProvider initial={initialBalance(user)} user={{ name: user.name, email: user.email }}>
      {children}
    </BillingProvider>
  );
}

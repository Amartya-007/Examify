import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { DEMO } from "@/lib/demo";

export default async function FocusLayout({ children }: { children: ReactNode }) {
  if (!DEMO && !(await isAuthenticated())) redirect("/sign-in");
  return <>{children}</>;
}

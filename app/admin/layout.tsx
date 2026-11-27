import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: { default: "Admin", template: "%s · Admin · Examify" }, robots: { index: false } };

/**
 * Admin area. Only users whose Firestore doc has role: "admin" get in; everyone else sees
 * a 404 so the route isn't advertised. The backend must enforce the same check on every
 * /api/admin/* endpoint (see docs/BILLING_INTEGRATION.md).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") notFound();
  return <AdminShell user={{ name: user.name, email: user.email }}>{children}</AdminShell>;
}

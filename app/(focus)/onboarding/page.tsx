import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Onboarding from "@/components/app/Onboarding";

export const metadata = { title: "Get set up" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return <Onboarding name={user.name} initial={{ role: user.targetRole, level: user.level, techstack: user.techstack }} />;
}

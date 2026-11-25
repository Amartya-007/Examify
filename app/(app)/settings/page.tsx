import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Settings from "@/components/app/Settings";

export const metadata = { title: "Settings" };

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const { tab } = await searchParams;
  return <Settings user={user} tab={tab === "preferences" || tab === "security" ? tab : "profile"} />;
}

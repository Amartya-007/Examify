import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import CreateInterview from "@/components/app/CreateInterview";

export const metadata = { title: "New interview" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const sp = await searchParams;
  return (
    <CreateInterview
      userId={user.id}
      initial={{
        role: sp.role || user.targetRole || "",
        level: sp.level || user.level || "Junior",
        stack: sp.stack ? sp.stack.split(",").filter(Boolean) : user.techstack || [],
      }}
    />
  );
}

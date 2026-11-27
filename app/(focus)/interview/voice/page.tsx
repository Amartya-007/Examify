import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import CallRoom from "@/components/call/CallRoom";

export const metadata = { title: "Set up by voice" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return <CallRoom mode="generate" user={{ id: user.id, name: user.name, profileURL: user.profileURL }} />;
}

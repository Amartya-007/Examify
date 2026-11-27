import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action";
import { DEMO, demoFeedback } from "@/lib/demo";
import CallRoom from "@/components/call/CallRoom";

export async function generateMetadata({ params }: RouteParams) {
  const { id } = await params;
  const i = await getInterviewById(id);
  return { title: i ? `${i.role} interview` : "Interview" };
}

export default async function Page({ params, searchParams }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const interview = await getInterviewById(id);
  if (!interview) notFound();
  const feedback = await getFeedbackByInterviewId({ interviewId: id, userId: user.id });
  const sp = await searchParams;
  const preview = DEMO ? (sp.preview as "lobby" | "live" | "analyzing" | "error" | undefined) : undefined;

  return (
    <CallRoom
      mode="interview"
      user={{ id: user.id, name: user.name, profileURL: user.profileURL }}
      interview={{ id, role: interview.role, level: interview.level, type: interview.type, questions: interview.questions, techstack: interview.techstack }}
      feedbackId={feedback?.id}
      preview={preview}
      previewLines={preview === "live" ? demoFeedback.i1.transcript : undefined}
    />
  );
}

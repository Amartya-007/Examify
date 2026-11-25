import Link from "next/link";
import { redirect } from "next/navigation";
import { Hash } from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbacksByUserId, getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import { computeStats } from "@/lib/stats";
import PageHeader from "@/components/app/PageHeader";
import NextUp, { type NextUpData } from "@/components/app/dashboard/NextUp";
import Progress from "@/components/app/dashboard/Progress";
import SkillMap from "@/components/app/dashboard/SkillMap";
import InterviewCard from "@/components/app/InterviewCard";
import InterviewList from "@/components/app/InterviewList";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Home" };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [mine, feedbacks, community] = await Promise.all([
    getInterviewsByUserId(user.id),
    getFeedbacksByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);
  const interviews = mine || [];
  const latestByInterview = new Map<string, Feedback>();
  for (const f of feedbacks) if (!latestByInterview.has(f.interviewId)) latestByInterview.set(f.interviewId, f);
  const stats = computeStats(feedbacks);
  const items = interviews.map((interview) => ({ interview, feedback: latestByInterview.get(interview.id) || null }));
  const taken = new Set(feedbacks.map((f) => f.interviewId));
  const explore = (community || []).filter((i) => !taken.has(i.id)).slice(0, 8);

  // Skill averages across all reports.
  const totals = new Map<string, { sum: number; n: number }>();
  feedbacks.forEach((f) => f.categoryScores?.forEach((c) => {
    const t = totals.get(c.name) || { sum: 0, n: 0 };
    totals.set(c.name, { sum: t.sum + c.score, n: t.n + 1 });
  }));
  const skills = [...totals].map(([name, { sum, n }]) => ({ name, score: Math.round(sum / n) }));

  // What to practise next: an untaken interview first, otherwise retake the latest one.
  const untaken = interviews.find((i) => !taken.has(i.id));
  const latest = feedbacks[0];
  const latestInterview = latest && interviews.find((i) => i.id === latest.interviewId);
  const next: NextUpData = untaken
    ? { kind: "new", interview: untaken }
    : latestInterview
      ? {
          kind: "retake",
          interview: latestInterview,
          last: latest.totalScore,
          weakest: [...latest.categoryScores].sort((a, b) => a.score - b.score)[0],
        }
      : { kind: "empty" };
  // If an untaken one exists but there is a recent weak spot, prefer the retake when it's very fresh.
  const nextUp: NextUpData =
    latestInterview && untaken && Date.now() - new Date(latest.createdAt).getTime() < 2 * 864e5
      ? { kind: "retake", interview: latestInterview, last: latest.totalScore, weakest: [...latest.categoryScores].sort((a, b) => a.score - b.score)[0] }
      : next;

  const chronological = [...feedbacks].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((f) => ({ score: f.totalScore, date: f.createdAt }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description={user.targetRole ? `Preparing for ${user.targetRole} roles.` : "Here's where you left off."}
        actions={
          <Button asChild variant="outline">
            <Link href="/join">
              <Hash /> Join with code
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <NextUp data={nextUp} />
        </div>
        <div className="lg:col-span-4">
          <Progress scores={chronological} average={stats.average} completed={stats.completed} streak={stats.streak} />
        </div>

        <section aria-labelledby="mine" className="rounded-[28px] border bg-card p-5 sm:p-6 lg:col-span-8">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="mine" className="text-xl font-semibold tracking-[-0.02em]">
              Your interviews
            </h2>
            <Link href="/interview" className="text-sm font-medium text-brand-strong hover:underline">
              Create new
            </Link>
          </div>
          {items.length ? (
            <InterviewList items={items} />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">Interviews you create appear here, with their latest score.</p>
          )}
        </section>

        <div className="flex flex-col gap-5 lg:col-span-4">
          <SkillMap skills={skills} />
        </div>
      </div>

      {explore.length > 0 && (
        <section aria-labelledby="community">
          <div className="mb-4">
            <h2 id="community" className="text-xl font-semibold tracking-[-0.02em]">
              From the community
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Interviews other people built. Take any of them as they are.</p>
          </div>
          <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {explore.map((i) => (
              <div key={i.id} className="w-[290px] shrink-0 snap-start sm:w-[320px]">
                <InterviewCard interview={i} community />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbacksByUserId, getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import { computeStats } from "@/lib/stats";
import PageHeader from "@/components/app/PageHeader";
import StartPanel from "@/components/app/dashboard/StartPanel";
import Progress from "@/components/app/dashboard/Progress";
import SkillMap from "@/components/app/dashboard/SkillMap";
import InterviewCard from "@/components/app/InterviewCard";
import InterviewList from "@/components/app/InterviewList";
import Carousel from "@/components/app/Carousel";

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

  const untaken = interviews.find((i) => !taken.has(i.id));

  const chronological = [...feedbacks].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((f) => ({ score: f.totalScore, date: f.createdAt }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description={user.targetRole ? `Preparing for ${user.targetRole} roles.` : "Here's where you left off."}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <StartPanel
            userId={user.id}
            role={user.targetRole}
            level={user.level}
            stack={user.techstack}
            untaken={untaken ? { id: untaken.id, role: untaken.role, questions: untaken.questions.length } : null}
          />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <Progress scores={chronological} average={stats.average} completed={stats.completed} streak={stats.streak} />
        </div>

        <section aria-labelledby="mine" className="min-w-0 rounded-[28px] border bg-card p-5 sm:p-6 lg:col-span-8">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="mine" className="text-xl font-semibold tracking-[-0.02em]">
              Your interviews and reports
            </h2>
          </div>
          {items.length ? (
            <InterviewList items={items} />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">Interviews you create appear here, with their latest score.</p>
          )}
        </section>

        <div className="flex min-w-0 flex-col gap-5 lg:col-span-4">
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
          <Carousel label="Interviews from the community" itemClassName="w-[82%] sm:w-[320px]">
            {explore.map((i) => (
              <InterviewCard key={i.id} interview={i} community />
            ))}
          </Carousel>
        </section>
      )}
    </div>
  );
}

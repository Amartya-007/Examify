import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Flame, Hash, Mic, Plus, Sparkles, Target, Trophy } from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbacksByUserId, getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import { computeStats, shortCategory } from "@/lib/stats";
import InterviewCard from "@/components/app/InterviewCard";
import InterviewList from "@/components/app/InterviewList";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };

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
  const byInterview = new Map<string, Feedback>();
  for (const f of feedbacks) if (!byInterview.has(f.interviewId)) byInterview.set(f.interviewId, f);
  const stats = computeStats(feedbacks);
  const items = (mine || []).map((interview) => ({ interview, feedback: byInterview.get(interview.id) || null }));
  const taken = new Set(feedbacks.map((f) => f.interviewId));
  const explore = (community || []).filter((i) => !taken.has(i.id)).slice(0, 6);

  const kpis = [
    { label: "Completed", value: String(stats.completed), sub: stats.completed === 1 ? "interview" : "interviews", icon: Trophy },
    { label: "Average score", value: stats.average != null ? String(stats.average) : "–", sub: stats.average != null ? "out of 100" : "after your first report", icon: Target },
    { label: "Strongest area", value: stats.strongest ? shortCategory(stats.strongest.name) : "–", sub: stats.strongest ? `${stats.strongest.score} average` : "appears after a report", icon: Sparkles, text: true },
    { label: "Streak", value: String(stats.streak), sub: stats.streak === 1 ? "day in a row" : "days in a row", icon: Flame },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">
            {user.targetRole ? `Preparing for ${user.targetRole} roles.` : "Pick up where you left off."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/join">
              <Hash /> Join with code
            </Link>
          </Button>
          <Button asChild variant="brand">
            <Link href="/interview">
              <Plus /> New interview
            </Link>
          </Button>
        </div>
      </section>

      <section aria-label="Your progress" className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-card lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className={`flex flex-col gap-3 p-5 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <k.icon className="size-4" /> {k.label}
            </p>
            <div>
              <p className={k.text ? "text-lg leading-tight font-semibold tracking-[-0.02em] break-words sm:text-2xl" : "num text-3xl font-semibold tracking-tight"}>{k.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{k.sub}</p>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="mine">
        <h2 id="mine" className="mb-4 text-lg font-semibold tracking-[-0.01em]">
          Your interviews
        </h2>
        {items.length ? (
          <InterviewList items={items} />
        ) : (
          <div className="grid overflow-hidden rounded-3xl border bg-card md:grid-cols-[1.2fr_1fr]">
            <div className="p-7 sm:p-10">
              <h3 className="text-2xl font-semibold tracking-[-0.02em]">Your first interview takes about five minutes</h3>
              <p className="mt-2 max-w-md text-[15px] text-muted-foreground">Choose a role and stack, answer out loud, and get a scored report with the full transcript.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild variant="brand" size="lg">
                  <Link href="/interview">
                    Create an interview <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/interview/voice">
                    <Mic /> Set up by voice
                  </Link>
                </Button>
              </div>
            </div>
            <ol className="flex flex-col justify-center gap-4 border-t bg-surface p-7 text-sm md:border-t-0 md:border-l sm:p-10">
              {["Pick a role, level and stack", "Talk with the AI interviewer", "Read your scored report"].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="num grid size-7 place-items-center rounded-full border bg-card text-xs font-semibold">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {explore.length > 0 && (
        <section aria-labelledby="community">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="community" className="text-lg font-semibold tracking-[-0.01em]">
                Practice from the community
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Interviews other people built. Take one as is.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {explore.map((i) => (
              <InterviewCard key={i.id} interview={i} community />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

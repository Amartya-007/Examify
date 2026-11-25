import Link from "next/link";
import dayjs from "dayjs";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mic, RotateCcw, ThumbsUp, TrendingUp } from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action";
import ScoreGauge from "@/components/report/ScoreGauge";
import { ScoreRing } from "@/components/app/InterviewCard";
import { shortCategory } from "@/lib/stats";
import { scoreLabel } from "@/lib/utils";
import Radar from "@/components/report/Radar";
import PrintButton from "@/components/report/PrintButton";
import TechIcons from "@/components/TechIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export async function generateMetadata({ params }: RouteParams) {
  const { id } = await params;
  const i = await getInterviewById(id);
  return { title: i ? `${i.role} report` : "Report" };
}

export default async function Feedback({ params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const interview = await getInterviewById(id);
  if (!interview) notFound();
  const feedback = await getFeedbackByInterviewId({ interviewId: id, userId: user.id });

  if (!feedback)
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-secondary">
          <Mic className="size-5" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">No report yet</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Take the {interview.role} interview and your scored report will appear here.</p>
        <Button asChild variant="brand" size="lg" className="mt-8">
          <Link href={`/interview/${id}`}>Start interview</Link>
        </Button>
      </div>
    );

  const transcript = feedback.transcript || [];
  const weakest = [...feedback.categoryScores].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard" className="no-print inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Dashboard
      </Link>

      <header className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">{interview.type}</Badge>
            <Badge variant="outline">{interview.level}</Badge>
            <span className="text-sm text-muted-foreground">{dayjs(feedback.createdAt).format("MMM D, YYYY · h:mm A")}</span>
          </div>
          <h1 className="type-page mt-3">{interview.role} interview</h1>
          <TechIcons techStack={interview.techstack} max={6} className="mt-3" />
        </div>
        <div className="no-print flex gap-2">
          <PrintButton />
          <Button asChild variant="brand">
            <Link href={`/interview/${id}`}>
              <RotateCcw /> Retake
            </Link>
          </Button>
        </div>
      </header>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="no-print">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcript">
            Transcript {transcript.length > 0 && <span className="num text-xs text-muted-foreground">{transcript.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          {/* Verdict: score, judgement in a sentence, and the one next action */}
          <section className="card-magic grid gap-8 rounded-[28px] p-6 sm:p-8 lg:grid-cols-[auto_1fr_300px] lg:items-center">
            <ScoreGauge score={feedback.totalScore} size={240} className="mx-auto" />
            <div>
              <h2 className="type-page">{scoreLabel(feedback.totalScore)}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-pretty">{feedback.finalAssessment}</p>
            </div>
            <div className="rounded-2xl bg-surface p-5">
              <p className="text-sm font-medium">Work on next</p>
              <p className="mt-2 flex items-baseline justify-between gap-3">
                <span className="text-lg font-semibold">{shortCategory(weakest.name)}</span>
                <span className="num text-sm text-warning">{weakest.score}/100</span>
              </p>
              {weakest.comment && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{weakest.comment}</p>}
              <Button asChild variant="brand" className="no-print mt-4 w-full">
                <Link href={`/interview/${id}`}>
                  <RotateCcw /> Retake to improve it
                </Link>
              </Button>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-12">
            <section aria-labelledby="breakdown" className="rounded-[28px] border bg-card p-6 sm:p-8 lg:col-span-7">
              <h2 id="breakdown" className="text-xl font-semibold tracking-[-0.02em]">
                Skill by skill
              </h2>
              <ul className="mt-2 divide-y">
                {[...feedback.categoryScores].sort((a, b) => b.score - a.score).map((c) => (
                  <li key={c.name} className="flex gap-4 py-5">
                    <ScoreRing score={c.score} size={48} />
                    <div className="min-w-0">
                      <p className="font-medium">{shortCategory(c.name)}</p>
                      {c.comment ? <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{c.comment}</p> : <p className="mt-1 text-sm text-muted-foreground">No comment for this skill.</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex flex-col gap-6 lg:col-span-5">
              <section className="flex flex-col items-center rounded-[28px] border bg-card p-6">
                <h2 className="self-start text-xl font-semibold tracking-[-0.02em]">Shape of your answers</h2>
                <Radar categories={feedback.categoryScores} size={300} />
              </section>
              <ListCard title="What went well" icon={<ThumbsUp className="size-4" />} tone="success" items={feedback.strengths} empty="No specific strengths recorded." />
              <ListCard title="What to work on" icon={<TrendingUp className="size-4" />} tone="brand" items={feedback.areasForImprovement} empty="Nothing flagged." />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transcript" className="mt-6">
          <section className="mx-auto max-w-3xl rounded-[28px] border bg-card p-6 sm:p-8">
            {transcript.length ? (
              <ol className="flex flex-col gap-4">
                {transcript.map((t, i) => (
                  <li key={i} className={`flex ${t.role === "assistant" ? "" : "justify-end"}`}>
                    <p className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${t.role === "assistant" ? "rounded-tl-md bg-secondary" : "rounded-tr-md bg-brand-soft"}`}>
                      <span className={`mb-1 block text-xs font-medium ${t.role === "assistant" ? "text-brand-strong" : "text-muted-foreground"}`}>
                        {t.role === "assistant" ? "Interviewer" : user.name.split(" ")[0]}
                      </span>
                      {t.content}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">This report was created before transcripts were saved. Retake the interview to keep the full transcript.</p>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ListCard({ title, icon, tone, items, empty }: { title: string; icon: React.ReactNode; tone: "success" | "brand"; items: string[]; empty: string }) {
  return (
    <div className="rounded-[28px] border bg-card p-6">
      <h2 className="flex items-center gap-2.5 font-sans text-base font-semibold">
        <span className={`grid size-8 place-items-center rounded-lg ${tone === "success" ? "bg-success-soft text-success" : "bg-brand-soft text-brand-strong"}`}>{icon}</span>
        {title}
      </h2>
      {items.length ? (
        <ul className="mt-5 flex flex-col gap-3">
          {items.map((s) => (
            <li key={s} className="flex gap-3 text-[15px] leading-relaxed">
              <span className={`mt-2.5 size-1.5 shrink-0 rounded-full ${tone === "success" ? "bg-success" : "bg-brand"}`} />
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

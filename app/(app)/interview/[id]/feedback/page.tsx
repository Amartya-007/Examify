import Link from "next/link";
import dayjs from "dayjs";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mic, RotateCcw, ThumbsUp, TrendingUp } from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action";
import ScoreGauge from "@/components/report/ScoreGauge";
import CategoryBars from "@/components/report/CategoryBars";
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
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{interview.role} interview</h1>
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
          <section className="grid gap-6 rounded-3xl border bg-card p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
            <ScoreGauge score={feedback.totalScore} className="mx-auto" />
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Overall assessment</h2>
              <p className="mt-2 text-[17px] leading-relaxed text-pretty">{feedback.finalAssessment}</p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border bg-card p-6 sm:p-8">
              <h2 className="text-lg font-semibold">Category breakdown</h2>
              <CategoryBars categories={feedback.categoryScores} className="mt-6" />
            </div>
            <div className="flex flex-col items-center justify-center rounded-3xl border bg-card p-6">
              <h2 className="self-start text-lg font-semibold">Shape of your answers</h2>
              <Radar categories={feedback.categoryScores} />
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <ListCard title="What went well" icon={<ThumbsUp className="size-4" />} tone="success" items={feedback.strengths} empty="No specific strengths recorded." />
            <ListCard title="What to work on" icon={<TrendingUp className="size-4" />} tone="brand" items={feedback.areasForImprovement} empty="Nothing flagged. Nice." />
          </section>
        </TabsContent>

        <TabsContent value="transcript" className="mt-6">
          <section className="rounded-3xl border bg-card p-6 sm:p-8">
            {transcript.length ? (
              <ol className="flex flex-col gap-5">
                {transcript.map((t, i) => (
                  <li key={i} className="grid gap-1 sm:grid-cols-[120px_1fr] sm:gap-6">
                    <span className={`text-sm font-medium ${t.role === "assistant" ? "text-brand-strong" : ""}`}>{t.role === "assistant" ? "Interviewer" : user.name.split(" ")[0]}</span>
                    <p className="text-[15px] leading-relaxed text-muted-foreground">{t.content}</p>
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
    <div className="rounded-3xl border bg-card p-6 sm:p-8">
      <h2 className="flex items-center gap-2.5 text-lg font-semibold">
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

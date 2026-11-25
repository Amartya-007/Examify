import Link from "next/link";
import dayjs from "dayjs";
import { Clock3, ListChecks, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import TechIcons from "@/components/TechIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const typeLabel = (t: string) => (/mix/i.test(t) ? "Mixed" : t);
const toneText = (s: number) => (s >= 80 ? "text-success" : s >= 60 ? "text-brand-strong" : s >= 40 ? "text-warning" : "text-destructive");
const toneStroke = (s: number) => (s >= 80 ? "var(--success)" : s >= 60 ? "var(--brand)" : s >= 40 ? "var(--warning)" : "var(--destructive)");

export function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const r = 20, c = 2 * Math.PI * r;
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={`Score ${score} out of 100`}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--muted)" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={toneStroke(score)} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <span className={cn("num text-sm font-semibold", toneText(score))}>{score}</span>
    </span>
  );
}

export default function InterviewCard({ interview, feedback, community = false }: { interview: Interview; feedback?: Feedback | null; community?: boolean }) {
  const { id, role, type, level, techstack, questions, createdAt } = interview;
  const href = feedback ? `/interview/${id}/feedback` : `/interview/${id}`;
  const date = dayjs(feedback?.createdAt || createdAt);

  return (
    <article className="card-magic group relative flex h-full flex-col rounded-[28px] p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-24px_var(--magic-2)] motion-reduce:hover:translate-y-0" style={{ animationDelay: `-${(id.charCodeAt(0) + id.length * 7) % 9}s` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={type === "Technical" ? "brand" : "outline"}>{typeLabel(type)}</Badge>
            <Badge variant="outline">{level}</Badge>
          </div>
          <h3 className="mt-3 text-xl leading-tight font-semibold tracking-[-0.02em]">
            <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-[28px] focus-visible:after:ring-[3px] focus-visible:after:ring-ring">
              {role}
            </Link>
          </h3>
        </div>
        {feedback && <ScoreRing score={feedback.totalScore} />}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ListChecks className="size-4" /> {questions?.length || 0} questions
        </span>
        <span className="flex items-center gap-1.5">
          <Clock3 className="size-4" /> {Math.max(5, Math.round((questions?.length || 5) * 2.5))} min
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <TechIcons techStack={techstack} />
        <div className="relative z-10 flex items-center gap-1.5">
          {feedback && (
            <Button asChild variant="ghost" size="icon-sm" aria-label={`Retake ${role}`}>
              <Link href={`/interview/${id}`}>
                <RotateCcw />
              </Link>
            </Button>
          )}
          <Button asChild size="sm" variant={feedback ? "outline" : "default"}>
            <Link href={href}>{feedback ? "View report" : community ? "Take it" : "Start"}</Link>
          </Button>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {feedback ? `Scored ${date.format("D MMM")}` : community ? `Shared ${date.format("D MMM")}` : `Created ${date.format("D MMM")}`}
      </p>
    </article>
  );
}

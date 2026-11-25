import Link from "next/link";
import dayjs from "dayjs";
import { ArrowUpRight, Clock3, RotateCcw } from "lucide-react";

import { cn, scoreTone } from "@/lib/utils";
import TechIcons from "@/components/TechIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const typeTone: Record<string, "brand" | "default" | "outline"> = { Technical: "brand", Behavioral: "default", Mixed: "outline" };

export default function InterviewCard({ interview, feedback, community = false }: { interview: Interview; feedback?: Feedback | null; community?: boolean }) {
  const { id, role, type, level, techstack, questions, createdAt } = interview;
  const score = feedback?.totalScore;
  const tone = score != null ? scoreTone(score) : null;
  const href = feedback ? `/interview/${id}/feedback` : `/interview/${id}`;
  const date = dayjs(feedback?.createdAt || createdAt);

  return (
    <article className="card-magic group relative flex flex-col rounded-2xl p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-24px_var(--magic-2)] motion-reduce:hover:translate-y-0" style={{ animationDelay: `-${(id.charCodeAt(0) + id.length * 7) % 9}s` }}>
      <div className="flex items-center justify-between gap-3">
        <Badge variant={typeTone[type] || "outline"}>{/mix/i.test(type) ? "Mixed" : type}</Badge>
        <time dateTime={date.toISOString()} className="text-xs text-muted-foreground">
          {date.format("MMM D")}
        </time>
      </div>
      <h3 className="mt-4 text-[17px] leading-snug font-semibold tracking-[-0.01em]">
        <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring">
          {role}
        </Link>
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        {level} <span aria-hidden>·</span> {questions?.length || 0} questions <span aria-hidden>·</span>
        <Clock3 className="size-3.5" /> ~{Math.max(5, Math.round((questions?.length || 5) * 2.5))} min
      </p>

      <div className="mt-5 flex min-h-7 items-center justify-between gap-3">
        <TechIcons techStack={techstack} />
        {feedback && feedback.finalAssessment && <span className="sr-only">{feedback.finalAssessment}</span>}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-[color-mix(in_oklab,var(--magic-2)_18%,var(--border))] pt-4">
        {score != null ? (
          <div>
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="num text-2xl font-semibold tracking-tight">
              <span className={cn(tone === "success" && "text-success", tone === "brand" && "text-brand-strong", tone === "warning" && "text-warning", tone === "destructive" && "text-destructive")}>{score}</span>
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{community ? "Shared by the community" : "Not taken yet"}</p>
        )}
        <div className="relative z-10 flex gap-1.5">
          {feedback && (
            <Button asChild variant="ghost" size="icon-sm" aria-label={`Retake ${role} interview`}>
              <Link href={`/interview/${id}`}>
                <RotateCcw />
              </Link>
            </Button>
          )}
          <Button asChild size="sm" variant={feedback ? "outline" : "default"}>
            <Link href={href}>
              {feedback ? "Report" : "Start"} <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

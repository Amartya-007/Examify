import Link from "next/link";
import { Clock3, Play, RotateCcw } from "lucide-react";
import VoiceRibbon from "@/components/brand/VoiceRibbon";
import TechIcons from "@/components/TechIcons";
import { shortCategory } from "@/lib/stats";
import { Button } from "@/components/ui/button";

export type NextUpData =
  | { kind: "new"; interview: Interview }
  | { kind: "retake"; interview: Interview; weakest: { name: string; score: number }; last: number }
  | { kind: "empty" };

export default function NextUp({ data }: { data: NextUpData }) {
  return (
    <section aria-labelledby="next-up" className="card-magic relative overflow-hidden rounded-[28px]">
      <div className="relative flex flex-col p-6 pb-2 sm:p-8 sm:pb-2">
        <p id="next-up" className="text-sm font-medium text-brand-strong">
          {data.kind === "retake" ? "Recommended retake" : data.kind === "new" ? "Ready to start" : "Your first interview"}
        </p>
        {data.kind === "empty" ? (
          <>
            <h2 className="type-title mt-3 max-w-lg">Pick a role. Answer out loud. Get scored.</h2>
            <p className="mt-3 max-w-md text-[15px] text-muted-foreground">It takes about five minutes, and the report shows exactly what to fix.</p>
            <div className="flex flex-wrap gap-2 pt-7">
              <Button asChild variant="brand" size="lg">
                <Link href="/interview">Create an interview</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="type-title mt-3 max-w-xl">{data.interview.role}</h2>
            <p className="mt-3 max-w-lg text-[15px] text-muted-foreground">
              {data.kind === "retake"
                ? `${shortCategory(data.weakest.name)} was your lowest area last time, at ${data.weakest.score}. A retake with the same questions shows whether it's moving.`
                : `${data.interview.questions.length} ${data.interview.type.toLowerCase()} questions at ${data.interview.level.toLowerCase()} level, waiting for your first attempt.`}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-7">
              <Button asChild variant="brand" size="lg">
                <Link href={`/interview/${data.interview.id}`}>
                  {data.kind === "retake" ? <RotateCcw /> : <Play />}
                  {data.kind === "retake" ? "Retake interview" : "Start interview"}
                </Link>
              </Button>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock3 className="size-4" /> About {Math.max(5, Math.round(data.interview.questions.length * 2.5))} minutes
              </span>
              <TechIcons techStack={data.interview.techstack} max={4} />
            </div>
          </>
        )}
      </div>
      <div className="relative h-28 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" aria-hidden="true">
        <VoiceRibbon amplitude={0.3} strands={6} />
      </div>
    </section>
  );
}

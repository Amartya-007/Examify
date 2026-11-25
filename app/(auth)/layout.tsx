import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { isAuthenticated } from "@/lib/actions/auth.action";
import { DEMO, demoFeedback } from "@/lib/demo";
import { Logo } from "@/components/brand/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import VoiceRibbon from "@/components/brand/VoiceRibbon";
import { ScoreRing } from "@/components/app/InterviewCard";
import CategoryBars from "@/components/report/CategoryBars";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  if (!DEMO && (await isAuthenticated())) redirect("/dashboard");
  const sample = demoFeedback.i1;

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle compact />
        </div>
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</main>
        <p className="text-center text-xs text-muted-foreground lg:text-left">
          By continuing you agree to the{" "}
          <Link href="/#faq" className="underline underline-offset-2 hover:text-foreground">
            terms and privacy notes
          </Link>
          .
        </p>
      </div>

      <aside className="bg-night relative hidden flex-col justify-between overflow-hidden border-l bg-surface lg:flex" aria-label="What you get">
        <div className="relative px-14 pt-24 xl:px-20">
          <h2 className="type-title max-w-lg">Rehearse out loud. Walk in ready.</h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-muted-foreground">
            A voice interviewer asks real questions for your role, then scores every answer on five skills.
          </p>
        </div>
        <div className="relative h-56 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" aria-hidden="true">
          <VoiceRibbon strands={6} amplitude={0.32} />
        </div>
        <div className="relative px-14 pb-16 xl:px-20">
          <div className="card-magic max-w-md rounded-[28px] p-6">
            <div className="flex items-center gap-4">
              <ScoreRing score={sample.totalScore} size={64} />
              <div>
                <p className="font-semibold">Sample report</p>
                <p className="text-sm text-muted-foreground">Frontend Developer, junior</p>
              </div>
            </div>
            <CategoryBars categories={sample.categoryScores.slice(0, 3)} showComments={false} className="mt-6 gap-4" />
          </div>
        </div>
      </aside>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { isAuthenticated } from "@/lib/actions/auth.action";
import { DEMO, demoFeedback } from "@/lib/demo";
import { Logo } from "@/components/brand/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Orb from "@/components/call/Orb";
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

      <aside className="relative hidden overflow-hidden border-l bg-surface lg:flex lg:flex-col lg:justify-center lg:px-14 xl:px-20" aria-label="What you get">
        <div className="bg-night pointer-events-none absolute inset-0" />
        <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative max-w-lg">
          <h2 className="text-[2.6rem] leading-[1.05] font-semibold tracking-[-0.04em] text-balance">
            Rehearse out loud. <span className="text-magic">Walk in ready.</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] text-muted-foreground">
            A voice interviewer asks real questions for your role, then scores every answer across five categories.
          </p>
          <div className="mt-10 rounded-3xl border bg-card p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.25)]">
            <div className="flex items-center gap-4">
              <Orb state="speaking" size={56} />
              <div>
                <p className="text-sm font-semibold">Frontend Developer · Junior</p>
                <p className="text-xs text-muted-foreground">Sample report · overall {sample.totalScore}/100</p>
              </div>
            </div>
            <CategoryBars categories={sample.categoryScores.slice(0, 3)} showComments={false} className="mt-6 gap-4" />
          </div>
        </div>
      </aside>
    </div>
  );
}

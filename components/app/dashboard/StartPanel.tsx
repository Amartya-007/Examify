"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Loader2, Mic, Play, SlidersHorizontal } from "lucide-react";

import { createInterview } from "@/lib/actions/general.action";
import VoiceRibbon from "@/components/brand/VoiceRibbon";

type Props = {
  userId: string;
  role?: string;
  level?: string;
  stack?: string[];
  untaken?: { id: string; role: string; questions: number } | null;
};

/** The first thing after login: start a mock interview, three ways. */
export default function StartPanel({ userId, role, level = "Junior", stack = [], untaken }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const quickStart = async () => {
    if (!role) return router.push("/interview");
    setBusy(true);
    const res = await createInterview({ userId, role, level, type: "Mixed", techstack: stack, amount: 5 });
    if (!res.success) {
      setBusy(false);
      return void toast.error(res.message);
    }
    router.push(`/interview/${res.id}`);
  };

  const tile =
    "group flex min-h-[72px] items-center gap-4 rounded-2xl border bg-card/70 p-4 text-left transition hover:border-[color-mix(in_oklab,var(--magic-2)_45%,var(--border))] hover:bg-card focus-visible:ring-[3px] focus-visible:ring-ring outline-none";

  return (
    <section aria-labelledby="start" className="card-magic overflow-hidden rounded-[28px]">
      <div className="p-5 sm:p-8">
        <h2 id="start" className="type-title">Start a mock interview</h2>
        <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">Answer out loud, get scored on five skills, and see exactly what to fix.</p>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.35fr_1fr]">
          {/* Primary: one tap, built from the profile */}
          <button
            onClick={quickStart}
            disabled={busy}
            className="bg-magic group flex min-h-[132px] cursor-pointer flex-col justify-between gap-4 rounded-2xl p-5 text-left text-white shadow-[0_18px_40px_-18px_var(--magic-2)] transition outline-none hover:brightness-110 focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-wait lg:row-span-2"
          >
            <span className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/85">Quick start</span>
              <span className="grid size-10 place-items-center rounded-full bg-white/20">
                {busy ? <Loader2 className="size-5 animate-spin" /> : <Play className="size-5 translate-x-px" />}
              </span>
            </span>
            <span>
              <span className="block text-xl leading-tight font-semibold tracking-[-0.02em] sm:text-2xl">
                {busy ? "Writing your questions" : role ? `${role} interview` : "Choose a role to begin"}
              </span>
              <span className="mt-1 block text-sm text-white/80">
                {role ? `${level}, ${stack.length ? stack.slice(0, 3).join(", ") : "general"}. 5 questions, about 13 minutes.` : "Takes about 30 seconds to set up."}
              </span>
            </span>
          </button>

          <Link href="/interview" className={tile}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary">
              <SlidersHorizontal className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Custom interview</span>
              <span className="block text-sm text-muted-foreground">Any role, level, focus and stack</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
          </Link>
          <Link href="/interview/voice" className={tile}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary">
              <Mic className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Set up by voice</span>
              <span className="block text-sm text-muted-foreground">Describe what you need in a short call</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {untaken && (
          <Link
            href={`/interview/${untaken.id}`}
            className="mt-3 flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm transition hover:bg-accent/60"
          >
            <span className="size-2 shrink-0 rounded-full bg-brand" />
            <span className="min-w-0 flex-1">
              Not taken yet: <span className="font-medium">{untaken.role}</span>
              <span className="text-muted-foreground">, {untaken.questions} questions</span>
            </span>
            <span className="font-medium text-brand-strong">Start</span>
          </Link>
        )}
      </div>
      <div className="h-20 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:h-24">
        <VoiceRibbon strands={5} amplitude={0.3} />
      </div>
    </section>
  );
}

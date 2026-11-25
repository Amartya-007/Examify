"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import Orb from "@/components/call/Orb";
import ScoreGauge from "@/components/report/ScoreGauge";
import CategoryBars from "@/components/report/CategoryBars";

type Line = { role: string; content: string };

/**
 * A playable sample session: the interviewer asks, the candidate answers, then the report.
 * Scripted with sample content (clearly labelled), driven by real product components.
 */
export default function LandingDemo({ lines, report }: { lines: Line[]; report: Feedback }) {
  const [step, setStep] = useState(0); // number of lines shown; lines.length + 1 = report
  const [playing, setPlaying] = useState(false);
  const orb = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const done = step > lines.length;
  const speaking = playing && !done && lines[Math.max(0, step - 1)]?.role === "assistant";

  useEffect(() => {
    if (!playing) return;
    if (done) return setPlaying(false);
    const id = setTimeout(() => setStep((s) => s + 1), step === 0 ? 400 : 2300);
    return () => clearTimeout(id);
  }, [playing, step, done]);

  // Start once, when the demo scrolls into view.
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setPlaying(true);
        io.disconnect();
      }
    }, { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const ol = list.current;
    if (ol) ol.scrollTo({ top: ol.scrollHeight, behavior: "smooth" });
  }, [step]);

  // Orb follows a simulated voice while the interviewer "speaks".
  useEffect(() => {
    if (!speaking) {
      orb.current?.style.setProperty("--level", "0");
      return;
    }
    let t = 0;
    const id = setInterval(() => {
      t += 0.4;
      orb.current?.style.setProperty("--level", String(Math.abs(Math.sin(t) * Math.cos(t * 0.37)) * 0.9));
    }, 90);
    return () => clearInterval(id);
  }, [speaking]);

  const control = () => {
    if (done) {
      setStep(0);
      setPlaying(true);
    } else setPlaying((p) => !p);
  };

  return (
    <div ref={root} className="card-magic overflow-hidden rounded-[32px] shadow-[0_60px_120px_-60px_var(--magic-2)]">
      <div className="flex items-center gap-3 border-b border-[color-mix(in_oklab,var(--magic-2)_16%,var(--border))] px-5 py-3.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-muted" />
          <span className="size-2.5 rounded-full bg-muted" />
          <span className="size-2.5 rounded-full bg-muted" />
        </span>
        <p className="flex-1 truncate text-center text-sm font-medium">Sample session: Frontend Developer, junior</p>
        <button
          onClick={control}
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-medium transition hover:bg-accent"
          aria-label={done ? "Replay sample" : playing ? "Pause sample" : "Play sample"}
        >
          {done ? <RotateCcw className="size-3.5" /> : playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {done ? "Replay" : playing ? "Pause" : step ? "Resume" : "Play"}
        </button>
      </div>

      <div className="grid min-h-[420px] md:grid-cols-[1fr_1.1fr]">
        {/* Stage */}
        <div className="relative flex flex-col items-center justify-center gap-6 bg-surface/70 p-8">
          {done ? (
            <div className="flex animate-rise flex-col items-center">
              <ScoreGauge score={report.totalScore} size={230} />
              <p className="mt-4 max-w-xs text-center text-sm text-muted-foreground">Report ready about 20 seconds after the call ends.</p>
            </div>
          ) : (
            <>
              <Orb ref={orb} state={!playing && step === 0 ? "idle" : speaking ? "speaking" : "listening"} size={170} />
              <p className="text-sm font-medium">
                {step === 0 ? "Press play to hear how a session runs" : speaking ? "Interviewer is asking" : "Candidate is answering"}
              </p>
              <div className="flex gap-1.5" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={cn("h-1.5 w-8 rounded-full transition-colors", Math.ceil(step / 2) > i ? "bg-magic" : "bg-muted")} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Transcript or report */}
        <div className="flex max-h-[440px] flex-col border-t md:border-t-0 md:border-l">
          {done ? (
            <div className="overflow-y-auto p-6">
              <p className="text-sm font-medium">Five skills, each with a comment</p>
              <CategoryBars categories={report.categoryScores.slice(0, 4)} className="mt-5 gap-4" />
            </div>
          ) : (
            <ol ref={list} className="flex-1 space-y-4 overflow-y-auto p-6" aria-live="polite">
              {step === 0 && <li className="text-sm text-muted-foreground">The transcript fills in here, line by line.</li>}
              {lines.slice(0, step).map((l, i) => (
                <li key={i} className={cn("flex animate-rise", l.role === "user" && "justify-end")}>
                  <p
                    className={cn(
                      "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      l.role === "assistant" ? "rounded-tl-md bg-secondary" : "rounded-tr-md bg-brand-soft text-foreground",
                    )}
                  >
                    <span className={cn("mb-1 block text-xs font-medium", l.role === "assistant" ? "text-brand-strong" : "text-muted-foreground")}>
                      {l.role === "assistant" ? "Interviewer" : "Candidate"}
                    </span>
                    {l.content}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

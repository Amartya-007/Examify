import Link from "next/link";
import { ArrowRight, Check, FileText, Mic, RotateCcw, SlidersHorizontal } from "lucide-react";

import { isAuthenticated } from "@/lib/actions/auth.action";
import { demoFeedback } from "@/lib/demo";
import { Logo } from "@/components/brand/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Orb from "@/components/call/Orb";
import ScoreGauge from "@/components/report/ScoreGauge";
import CategoryBars from "@/components/report/CategoryBars";
import Radar from "@/components/report/Radar";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const sample = demoFeedback.i1;

const FAQ = [
  { q: "Is it really a voice interview?", a: "Yes. You speak and the interviewer speaks back in real time. It listens for when you finish, asks follow-ups when an answer is vague, and moves through your question list." },
  { q: "What do I need?", a: "A browser with microphone access. Headphones help avoid echo. Your camera is optional and stays on your device; only audio is sent." },
  { q: "How is my score calculated?", a: "After the call, the full transcript is reviewed against five categories: communication, technical knowledge, problem solving, role fit, and confidence. Each gets a score out of 100 and a written comment." },
  { q: "Which roles and stacks are supported?", a: "Any role you can describe. Pick a level, a focus (technical, behavioral or mixed) and up to eight technologies, and questions are written for that combination." },
  { q: "Who can see my reports?", a: "Only you. If you share a join code, the other person takes the same questions but gets their own private report." },
];

export default async function Landing() {
  const authed = await isAuthenticated().catch(() => false);
  const primary = authed ? { href: "/dashboard", label: "Open dashboard" } : { href: "/sign-up", label: "Start practicing" };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-40 border-b border-transparent bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Sections" className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
            {[
              ["#how", "How it works"],
              ["#report", "The report"],
              ["#faq", "FAQ"],
            ].map(([h, l]) => (
              <a key={h} href={h} className="rounded-lg px-3 py-2 transition hover:bg-accent hover:text-foreground">
                {l}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle compact />
            {!authed && (
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
            <Button asChild size="sm">
              <Link href={primary.href}>{authed ? "Dashboard" : "Start free"}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28">
            <div className="animate-rise">
              <h1 className="text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.25rem]">
                Practice the interview before the interview.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground text-pretty">
                Answer out loud to an AI interviewer, then get a scored report with the full transcript.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="xl" variant="brand">
                  <Link href={primary.href}>
                    {primary.label} <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline">
                  <a href="#report">See a sample report</a>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl animate-rise [animation-delay:120ms]">
              <div className="rounded-[28px] border bg-card p-2 shadow-[0_40px_80px_-40px_rgba(0,0,0,.35)]">
                <div className="flex items-center justify-between px-3 pt-2 pb-3">
                  <p className="text-sm font-semibold">Frontend Developer · Junior</p>
                  <span className="num flex items-center gap-2 rounded-md border px-2 py-0.5 text-xs">
                    <span className="size-1.5 rounded-full bg-success" /> 04:18
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-[22px] bg-surface px-6 pt-10 pb-8">
                  <Orb state="speaking" size={150} />
                  <p className="mt-6 text-sm font-medium">Interviewer is speaking</p>
                  <p className="mt-2 max-w-sm text-center text-[15px] leading-relaxed text-muted-foreground">
                    Good. What are React Server Components, and how do they differ from server-side rendering?
                  </p>
                  <div className="mt-7 flex items-center gap-1.5" aria-hidden="true">
                    {["Q1", "Q2", "Q3", "Q4", "Q5"].map((q, i) => (
                      <span key={q} className={`h-1.5 w-6 rounded-full ${i < 2 ? "bg-brand" : "bg-muted"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -left-4 hidden rounded-2xl border bg-card p-4 pr-6 shadow-xl sm:flex sm:items-center sm:gap-2 lg:-left-12">
                <ScoreGauge score={sample.totalScore} size={130} />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-y bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
            <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Five minutes from sign-up to your first answer</h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
              {[
                { icon: SlidersHorizontal, t: "Set the brief", d: "Role, level, focus and stack. Or describe it in a short voice call." },
                { icon: Mic, t: "Talk it through", d: "Check your mic in the green room, then answer naturally. Take notes on the side." },
                { icon: FileText, t: "Read the report", d: "A score out of 100, five category scores with comments, and every line of the transcript." },
              ].map((s, i) => (
                <li key={s.t} className="relative md:pr-10">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl border bg-card">
                      <s.icon className="size-[18px]" />
                    </span>
                    <span className="hidden h-px flex-1 bg-border md:block" />
                  </div>
                  <p className="num mt-6 text-xs text-muted-foreground">Step {i + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
                  <p className="mt-2 max-w-xs text-[15px] text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Report */}
        <section id="report" className="scroll-mt-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-28">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Feedback you can act on tonight</h2>
              <p className="mt-4 max-w-md text-[17px] text-muted-foreground">Every report names what landed, what to fix, and why, using your own words from the transcript.</p>
              <ul className="mt-8 flex flex-col gap-3 text-[15px]">
                {sample.areasForImprovement.map((s) => (
                  <li key={s} className="flex gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-brand" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] border bg-card p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Sample report</p>
                <span className="num text-sm text-muted-foreground">{sample.totalScore}/100</span>
              </div>
              <div className="mt-6 grid items-center gap-6 md:grid-cols-[1fr_auto]">
                <CategoryBars categories={sample.categoryScores} showComments={false} className="gap-4" />
                <div className="hidden md:block">
                  <Radar categories={sample.categoryScores} size={240} />
                </div>
              </div>
              <p className="mt-6 border-t pt-5 text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Technical · 74.</span> {sample.categoryScores[1].comment}
              </p>
            </div>
          </div>
        </section>

        {/* Bento */}
        <section className="border-t">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
            <h2 className="max-w-lg text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Built around how interviews actually feel</h2>
            <div className="mt-12 grid gap-4 md:grid-cols-6">
              <div className="rounded-3xl border bg-card p-7 md:col-span-4">
                <h3 className="text-lg font-semibold">Questions for your exact stack</h3>
                <p className="mt-1.5 max-w-md text-[15px] text-muted-foreground">Pick up to eight technologies. The interviewer asks about them at your level.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Docker", "Python", "Go", "Kotlin", "Figma"].map((t, i) => (
                    <span key={t} className={`rounded-full border px-3.5 py-1.5 text-sm ${i < 3 ? "border-foreground bg-foreground text-background" : "bg-surface"}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-3xl border bg-brand-soft p-7 md:col-span-2">
                <Mic className="size-6 text-brand-strong" />
                <div className="mt-10">
                  <h3 className="text-lg font-semibold">A green room first</h3>
                  <p className="mt-1.5 text-[15px] text-muted-foreground">Test your mic, camera and speakers before the clock starts.</p>
                </div>
              </div>
              <div className="rounded-3xl border bg-card p-7 md:col-span-3">
                <h3 className="text-lg font-semibold">Every word, saved</h3>
                <p className="mt-1.5 text-[15px] text-muted-foreground">Read the full transcript next to your scores.</p>
                <div className="mt-6 space-y-3 rounded-2xl bg-surface p-4 text-sm">
                  {sample.transcript!.slice(1, 3).map((l, i) => (
                    <p key={i} className="line-clamp-2 text-muted-foreground">
                      <span className={`mr-2 font-medium ${l.role === "assistant" ? "text-brand-strong" : "text-foreground"}`}>{l.role === "assistant" ? "Interviewer" : "You"}</span>
                      {l.content}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border bg-card p-7 md:col-span-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <RotateCcw className="size-4" /> Retake and watch it climb
                </h3>
                <p className="mt-1.5 text-[15px] text-muted-foreground">Same questions, a fresh attempt, a new score.</p>
                <div className="mt-6 flex items-end gap-3" aria-hidden="true">
                  {[52, 61, 58, 70, 78].map((v, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
                      <span className="num text-xs text-muted-foreground">{v}</span>
                      <span className={`w-full rounded-t-lg ${i === 4 ? "bg-brand" : "bg-muted"}`} style={{ height: v * 1.3 }} />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Illustration</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t bg-surface">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
            <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Questions</h2>
            <Accordion type="single" collapsible className="rounded-3xl border bg-card px-6">
              {FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`q${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-center md:justify-between lg:py-24">
            <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">Your next interview is a rehearsal away.</h2>
            <Button asChild size="xl" variant="brand">
              <Link href={primary.href}>
                {primary.label} <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo size="sm" />
          <p>Practice smarter. Perform better.</p>
          <a href="https://github.com/Amartya-007/Examify" className="hover:text-foreground">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

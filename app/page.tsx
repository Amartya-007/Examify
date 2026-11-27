import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

import { isAuthenticated } from "@/lib/actions/auth.action";
import { demoFeedback } from "@/lib/demo";
import { shortCategory } from "@/lib/stats";
import { Logo } from "@/components/brand/Logo";
import VoiceRibbon from "@/components/brand/VoiceRibbon";
import ThemeToggle from "@/components/ThemeToggle";
import HeroVoice from "@/components/marketing/HeroVoice";
import LandingDemo from "@/components/marketing/LandingDemo";
import PricingSection from "@/components/marketing/PricingSection";
import Radar from "@/components/report/Radar";
import { ScoreRing } from "@/components/app/InterviewCard";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const sample = demoFeedback.i1;

const FAQ = [
  { q: "Is it really a voice interview?", a: "Yes. You speak and the interviewer answers in real time. It waits for you to finish, follows up when an answer is vague, and works through your question list." },
  { q: "What do I need?", a: "A browser with a microphone. Headphones help avoid echo. Your camera is optional and stays on your device; only audio is sent." },
  { q: "How is the score worked out?", a: "After the call, the full transcript is reviewed against five skills: communication, technical knowledge, problem solving, role fit and confidence. Each gets a score out of 100 and a written comment." },
  { q: "Which roles and stacks work?", a: "Any role you can describe. Choose a level, a focus (technical, behavioral or mixed) and up to eight technologies, and the questions are written for that mix." },
  { q: "Who can see my reports?", a: "Only you. Reports and transcripts are private to your account." },
  { q: "How do credits work?", a: "Each question costs 2 credits, so a 5-question interview uses 10. New accounts get 20 free credits. Packs never expire; Pro adds 600 credits every month." },
  { q: "How do I pay, and can I cancel?", a: "Payments go through Razorpay: UPI, cards, netbanking and wallets. Cancel Pro any time from Billing; it stays active until the end of the period you paid for." },
];

export default async function Landing() {
  const authed = await isAuthenticated().catch(() => false);
  const primary = authed ? { href: "/dashboard", label: "Open your dashboard" } : { href: "/sign-up", label: "Start practicing free" };
  const weakest = [...sample.categoryScores].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip">
      {/* Floating nav */}
      <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4">
        <div className="glass mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-2xl pr-2 pl-4">
          <Logo />
          <nav aria-label="Sections" className="ml-6 hidden items-center gap-1 text-sm text-muted-foreground md:flex">
            {[
              ["#demo", "Sample session"],
              ["#how", "How it works"],
              ["#report", "Your report"],
              ["#pricing", "Pricing"],
              ["#faq", "Questions"],
            ].map(([h, l]) => (
              <a key={h} href={h} className="rounded-lg px-3 py-2 transition hover:bg-accent hover:text-foreground">
                {l}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle compact />
            {!authed && (
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
            <Button asChild size="sm" variant="brand">
              <Link href={primary.href}>{authed ? "Dashboard" : "Get started"}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="bg-night relative flex flex-col pt-32 sm:pt-40">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
            <h1 className="type-hero animate-rise">
              Rehearse out loud.
              <br />
              <span className="text-muted-foreground">Walk in ready.</span>
            </h1>
            <div className="mt-8 flex animate-rise flex-col gap-7 [animation-delay:120ms] lg:flex-row lg:items-end lg:justify-between">
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                An AI interviewer asks real questions for your role. You get scored on five skills, with every word of the transcript.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="xl" variant="brand">
                  <Link href={primary.href}>{primary.label}</Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="bg-transparent">
                  <a href="#demo">Play a sample session</a>
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-6 animate-rise [animation-delay:240ms] sm:mt-8">
            <HeroVoice />
          </div>
        </section>

        {/* Playable demo, right under the hero */}
        <section id="demo" className="scroll-mt-24 px-5 pt-10 pb-24 sm:px-6 lg:pb-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <h2 className="type-title max-w-xl">Hear a session before you take one</h2>
              <p className="max-w-sm text-[15px] text-muted-foreground">Press play. Sample questions and answers, the same screens you will use.</p>
            </div>
            <LandingDemo lines={sample.transcript!.slice(0, 4)} report={sample} />
          </div>
        </section>

        {/* How it works: a real sequence, so it is numbered */}
        <section id="how" className="scroll-mt-24 border-y bg-surface/60 px-5 py-24 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className="type-title max-w-xl">Five minutes from sign‑up to your first answer</h2>
            <ol className="mt-14 grid gap-5 md:grid-cols-3">
              <li className="flex flex-col rounded-[28px] border bg-card p-6">
                <span className="num text-sm text-brand-strong">1</span>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em]">Set the brief</h3>
                <p className="mt-2 text-[15px] text-muted-foreground">Role, level, focus and stack. Or describe it in a short voice call.</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-8" aria-hidden="true">
                  {["React", "TypeScript", "Next.js", "Junior", "Technical"].map((t, i) => (
                    <span key={t} className={`rounded-full border px-3 py-1 text-xs ${i < 3 ? "border-transparent bg-foreground text-background" : ""}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </li>
              <li className="flex flex-col overflow-hidden rounded-[28px] border bg-card p-6">
                <span className="num text-sm text-brand-strong">2</span>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em]">Talk it through</h3>
                <p className="mt-2 text-[15px] text-muted-foreground">Check your mic in the green room, then answer naturally. Keep notes on the side.</p>
                <div className="-mx-6 mt-auto h-24 pt-4" aria-hidden="true">
                  <VoiceRibbon strands={4} amplitude={0.3} pointer={false} />
                </div>
              </li>
              <li className="flex flex-col rounded-[28px] border bg-card p-6">
                <span className="num text-sm text-brand-strong">3</span>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em]">Read the report</h3>
                <p className="mt-2 text-[15px] text-muted-foreground">A score out of 100, five skill scores with comments, and the transcript.</p>
                <div className="mt-auto flex items-center gap-3 pt-8" aria-hidden="true">
                  {sample.categoryScores.slice(0, 4).map((c) => (
                    <ScoreRing key={c.name} score={c.score} size={48} />
                  ))}
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Report: the judgement, its reasons, and the next action */}
        <section id="report" className="scroll-mt-24 px-5 py-24 sm:px-6 lg:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <div>
              <h2 className="type-title">Feedback that names the fix</h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted-foreground">
                Every report says what landed, what to work on and why, using your own words from the transcript.
              </p>
              <ul className="mt-8 flex flex-col gap-3 text-[15px]">
                {sample.areasForImprovement.map((s) => (
                  <li key={s} className="flex gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-brand" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-magic rounded-[32px] p-6 sm:p-8">
              <div className="flex items-center gap-5">
                <ScoreRing score={sample.totalScore} size={84} />
                <div>
                  <p className="text-xl font-semibold tracking-[-0.02em]">Strong, close to hire</p>
                  <p className="mt-1 text-sm text-muted-foreground">Sample report, Frontend Developer</p>
                </div>
              </div>
              <div className="mt-6 grid items-center gap-4 sm:grid-cols-[1fr_auto]">
                <p className="text-[15px] leading-relaxed">{sample.finalAssessment}</p>
                <div className="hidden sm:block">
                  <Radar categories={sample.categoryScores} size={210} />
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-surface p-4 text-sm">
                <p className="font-medium">
                  Next: work on {shortCategory(weakest.name).toLowerCase()} ({weakest.score})
                </p>
                <p className="mt-1 text-muted-foreground">{weakest.comment}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-24 border-t px-5 py-24 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <PricingSection ctaHref={primary.href} />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 border-t bg-surface/60 px-5 py-24 sm:px-6 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="type-title">Questions people ask</h2>
            <Accordion type="single" collapsible className="rounded-[28px] border bg-card px-6">
              {FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`q${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-night relative overflow-hidden border-t px-5 pt-24 sm:px-6 lg:pt-32">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <h2 className="type-hero max-w-3xl text-[clamp(2.5rem,5.5vw,4.75rem)]">Your next interview starts with a rehearsal.</h2>
            <Button asChild size="xl" variant="brand" className="shrink-0">
              <Link href={primary.href}>{primary.label}</Link>
            </Button>
          </div>
          <div className="mt-10 h-40 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]" aria-hidden="true">
            <VoiceRibbon strands={5} amplitude={0.3} />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo size="sm" />
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/refunds" className="hover:text-foreground">Refunds</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </nav>
          <a href="https://github.com/Amartya-007/Examify" className="inline-flex items-center gap-1 hover:text-foreground">
            Source on GitHub <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </footer>
    </div>
  );
}

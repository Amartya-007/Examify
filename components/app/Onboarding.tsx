"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus } from "lucide-react";

import { updateUserProfile } from "@/lib/actions/auth.action";
import { GOALS, LEVELS, ROLES, STACK } from "@/lib/options";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import Chip from "@/components/app/Chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STEPS = ["Your goal", "Role and stack"];

export default function Onboarding({ name, initial }: { name: string; initial: { role?: string; level?: string; techstack?: string[] } }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string>("job");
  const [level, setLevel] = useState(initial.level || "Junior");
  const [role, setRole] = useState(initial.role || "");
  const [customRole, setCustomRole] = useState("");
  const [stack, setStack] = useState<string[]>(initial.techstack || []);
  const [customTech, setCustomTech] = useState("");
  const [saving, setSaving] = useState(false);
  const [roleError, setRoleError] = useState("");

  const finalRole = (role === "__custom" ? customRole : role).trim();

  const save = async (dest: "dashboard" | "interview", skip = false) => {
    if (!skip && !finalRole) return setRoleError("Pick a role or type your own.");
    setRoleError("");
    setSaving(true);
    const res = await updateUserProfile(
      skip ? { onboarded: true } : { targetRole: finalRole || undefined, level, techstack: stack, onboarded: true },
    );
    if (!res.success) {
      setSaving(false);
      return void toast.error(res.message || "We couldn't save that. Try again.");
    }
    const q = new URLSearchParams({ role: finalRole, level, stack: stack.join(",") });
    router.push(dest === "interview" ? `/interview?${q}` : "/dashboard");
    router.refresh();
  };

  const next = () => {
    if (step === 1 && !finalRole) return setRoleError("Pick a role or type your own.");
    setRoleError("");
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const toggleTech = (t: string) => setStack((s) => (s.includes(t) ? s.filter((x) => x !== t) : s.length >= 8 ? s : [...s, t]));
  const addTech = () => {
    const t = customTech.trim();
    if (t && !stack.includes(t)) toggleTech(t);
    setCustomTech("");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-8">
        <Logo href={null} />
        <Button variant="ghost" size="sm" onClick={() => save("dashboard", true)} disabled={saving}>
          Skip setup
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-6 pb-10 sm:px-6 sm:pt-12">
        <ol className="flex items-center gap-2" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col gap-2" aria-current={i === step ? "step" : undefined}>
              <span className={cn("h-1 rounded-full transition-colors", i <= step ? "bg-brand" : "bg-muted")} />
              <span className={cn("text-xs font-medium", i === step ? "text-foreground" : "text-muted-foreground")}>
                <span className="num">{i + 1}</span> · {s}
              </span>
            </li>
          ))}
        </ol>

        <section key={step} className="mt-10 flex-1 animate-rise">
          {step === 0 && (
            <>
              <h1 className="type-page">Hi {name.split(" ")[0]}, what are you preparing for?</h1>
              <p className="mt-2 text-[15px] text-muted-foreground">We use this to pitch the questions at the right level. You can change it any time.</p>
              <div role="radiogroup" aria-label="Goal" className="mt-8 grid gap-3 sm:grid-cols-2">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    role="radio"
                    aria-checked={goal === g.id}
                    onClick={() => setGoal(g.id)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4 text-left transition outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                      goal === g.id ? "border-foreground ring-1 ring-foreground" : "hover:border-foreground/30",
                    )}
                  >
                    <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border", goal === g.id && "border-foreground bg-foreground text-background")}>
                      {goal === g.id && <Check className="size-3" />}
                    </span>
                    <span>
                      <span className="block font-medium">{g.label}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{g.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-8 mb-3 text-sm font-medium">Experience level</p>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <Chip key={l} selected={level === l} onClick={() => setLevel(l)}>
                    {l}
                  </Chip>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="type-page">Which role, which stack?</h1>
              <p className="mt-2 text-[15px] text-muted-foreground">Pick a role and up to eight technologies you want to be asked about.</p>
              <p className="mt-8 mb-3 text-sm font-medium">Target role</p>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <Chip key={r} selected={role === r} onClick={() => setRole(r)}>
                    {r}
                  </Chip>
                ))}
                <Chip selected={role === "__custom"} onClick={() => setRole("__custom")}>
                  Something else
                </Chip>
              </div>
              {role === "__custom" && (
                <Input autoFocus className="mt-3 max-w-sm" placeholder="e.g. Site Reliability Engineer" value={customRole} onChange={(e) => setCustomRole(e.target.value)} aria-label="Your role" />
              )}
              {roleError && (
                <p role="alert" className="mt-2 text-[13px] text-destructive">
                  {roleError}
                </p>
              )}
              <div className="mt-8 mb-3 flex items-baseline justify-between">
                <p className="text-sm font-medium">Tech stack</p>
                <span className="num text-xs text-muted-foreground">{stack.length}/8</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...STACK, ...stack.filter((s) => !(STACK as readonly string[]).includes(s))].map((t) => (
                  <Chip key={t} selected={stack.includes(t)} onClick={() => toggleTech(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
              <form
                className="mt-3 flex max-w-sm gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addTech();
                }}
              >
                <Input placeholder="Add another, e.g. GraphQL" value={customTech} onChange={(e) => setCustomTech(e.target.value)} aria-label="Add a technology" className="h-10" />
                <Button type="submit" variant="outline" disabled={!customTech.trim()}>
                  <Plus /> Add
                </Button>
              </form>
            </>
          )}

        </section>

        <div className="mt-10 flex items-center justify-between gap-3 border-t pt-6">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className={cn(step === 0 && "invisible")}>
            <ArrowLeft /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="lg" onClick={next}>
              Continue <ArrowRight />
            </Button>
          ) : (
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button size="lg" variant="outline" onClick={() => save("dashboard")} disabled={saving}>
                Go to dashboard
              </Button>
              <Button size="lg" variant="brand" onClick={() => save("interview")} disabled={saving}>
                {saving && <Loader2 className="animate-spin" />} Start first interview
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

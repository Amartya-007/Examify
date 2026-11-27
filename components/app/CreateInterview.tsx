"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, FileText, Loader2, Mic, Plus } from "lucide-react";

import { createInterview } from "@/lib/actions/general.action";
import { LEVELS, ROLES, STACK, TYPES } from "@/lib/options";
import { cn } from "@/lib/utils";
import Chip from "@/components/app/Chip";
import { useBilling } from "@/components/billing/BillingProvider";
import { interviewCost } from "@/lib/billing/config";
import { Field } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "form" | "voice";
const COUNTS = [3, 5, 7, 10];

export default function CreateInterview({ userId, initial }: { userId: string; initial: { role: string; level: string; stack: string[] } }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("form");
  const [role, setRole] = useState(initial.role);
  const [level, setLevel] = useState(initial.level);
  const [type, setType] = useState<string>("Mixed");
  const [stack, setStack] = useState<string[]>(initial.stack);
  const [tech, setTech] = useState("");
  const [amount, setAmount] = useState(5);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const billing = useBilling();

  const toggle = (t: string) => setStack((s) => (s.includes(t) ? s.filter((x) => x !== t) : s.length >= 8 ? s : [...s, t]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role.trim().length < 2) return setError("Enter the role you're preparing for.");
    setError("");
    setBusy(true);
    const res = await createInterview({ userId, role, level, type, techstack: stack, amount });
    if (!res.success) {
      setBusy(false);
      return void toast.error(res.message);
    }
    toast.success("Interview ready. Check your devices, then join.");
    router.push(`/interview/${res.id}`);
  };

  const modes: { id: Mode; title: string; body: string; icon: typeof FileText }[] = [
    { id: "form", title: "Build with a form", body: "Choose role, level and stack. Ready in seconds.", icon: FileText },
    { id: "voice", title: "Set up by voice", body: "Describe what you need in a short call.", icon: Mic },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="type-page">New interview</h1>
      <p className="mt-1.5 text-[15px] text-muted-foreground">Questions are written for your role and stack, then read aloud by your AI interviewer.</p>

      <div role="radiogroup" aria-label="How do you want to set it up?" className="mt-8 grid gap-3 sm:grid-cols-2">
        {modes.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => (m.id === "voice" ? router.push("/interview/voice") : setMode(m.id))}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-3 rounded-2xl border bg-card p-4 text-left transition outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
              mode === m.id ? "border-foreground ring-1 ring-foreground" : "hover:border-foreground/30",
            )}
          >
            <span className={cn("grid size-9 place-items-center rounded-xl", mode === m.id ? "bg-foreground text-background" : "bg-secondary")}>
              <m.icon className="size-4" />
            </span>
            <span>
              <span className="block font-medium">{m.title}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{m.body}</span>
            </span>
          </button>
        ))}
      </div>

      {mode === "form" && (
        <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-8 rounded-[28px] border bg-card p-5 sm:p-8">
          <Field label="Role" id="role" error={error}>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Developer" aria-invalid={!!error} list="roles" />
            <datalist id="roles">
              {ROLES.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </Field>

          <div className="grid gap-8 md:grid-cols-2">
            <fieldset>
              <legend className="mb-3 text-sm font-medium">Level</legend>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <Chip key={l} selected={level === l} onClick={() => setLevel(l)}>
                    {l}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 text-sm font-medium">Number of questions</legend>
              <div className="flex flex-wrap gap-2">
                {COUNTS.map((c) => (
                  <Chip key={c} selected={amount === c} onClick={() => setAmount(c)}>
                    <span className="num">{c}</span>
                  </Chip>
                ))}
                <span className="self-center text-sm text-muted-foreground">~{Math.round(amount * 2.5)} min</span>
              </div>
            </fieldset>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-medium">Focus</legend>
            <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={type === t.id}
                  onClick={() => setType(t.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                    type === t.id ? "border-foreground bg-accent" : "hover:border-foreground/30",
                  )}
                >
                  <span className={cn("grid size-4 shrink-0 place-items-center rounded-full border", type === t.id && "border-[5px] border-foreground")} />
                  <span>
                    <span className="block text-sm font-medium">{t.id}</span>
                    <span className="block text-xs text-muted-foreground">{t.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <div className="mb-3 flex items-baseline justify-between">
              <legend className="text-sm font-medium">Tech stack</legend>
              <span className="num text-xs text-muted-foreground">{stack.length}/8</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...STACK, ...stack.filter((s) => !(STACK as readonly string[]).includes(s))].map((t) => (
                <Chip key={t} selected={stack.includes(t)} onClick={() => toggle(t)} className="h-8 px-3 text-[13px]">
                  {t}
                </Chip>
              ))}
            </div>
            <div className="mt-3 flex max-w-sm gap-2">
              <Input
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (tech.trim()) toggle(tech.trim());
                    setTech("");
                  }
                }}
                placeholder="Add another"
                aria-label="Add a technology"
                className="h-10"
              />
              <Button
                type="button"
                variant="outline"
                disabled={!tech.trim()}
                onClick={() => {
                  toggle(tech.trim());
                  setTech("");
                }}
              >
                <Plus /> Add
              </Button>
            </div>
          </fieldset>

          <div className="flex flex-col-reverse items-stretch gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Uses <span className="num font-medium text-foreground">{interviewCost(amount)}</span> credits when you start. You have{" "}
              <span className={cn("num font-medium", billing.balance.credits < interviewCost(amount) ? "text-warning" : "text-foreground")}>{billing.balance.credits}</span>.
            </p>
            <Button type="submit" size="lg" variant="brand" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" /> Writing questions
                </>
              ) : (
                <>
                  Create interview <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}

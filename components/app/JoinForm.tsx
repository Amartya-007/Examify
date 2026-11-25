"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Hash, Loader2 } from "lucide-react";

import { resolveJoinCode } from "@/lib/actions/general.action";
import { Field } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return setError("Paste a join code or invite link.");
    setBusy(true);
    setError("");
    const found = await resolveJoinCode(code);
    if (!found) {
      setBusy(false);
      return setError("We couldn't find that interview. Check the code and try again.");
    }
    router.push(`/interview/${found.id}`);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center pt-6 text-center sm:pt-16">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
        <Hash className="size-5" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-[-0.03em]">Join an interview</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">Enter the code someone shared with you. You&apos;ll check your devices before it starts.</p>
      <form onSubmit={submit} noValidate className="mt-8 flex w-full flex-col gap-3 text-left">
        <Field label="Join code or link" id="code" error={error}>
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 7FqK2mPz or an invite link" aria-invalid={!!error} className="num" autoComplete="off" />
        </Field>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : null} Continue to green room {!busy && <ArrowRight />}
        </Button>
      </form>
    </div>
  );
}

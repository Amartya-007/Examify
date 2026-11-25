"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "@/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/AuthForm";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email, like name@example.com.");
    setError("");
    setState("sending");
    try {
      if (process.env.NEXT_PUBLIC_EXAMIFY_DEMO !== "1") await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/too-many-requests") {
        setState("idle");
        return setError("Too many attempts. Wait a minute, then try again.");
      }
      // Any other result shows the same message so we don't reveal which emails have accounts.
    }
    setState("sent");
  };

  if (state === "sent")
    return (
      <div className="animate-rise">
        <span className="grid size-12 place-items-center rounded-2xl bg-success-soft text-success">
          <MailCheck className="size-6" />
        </span>
        <h1 className="mt-6 type-page">Check your inbox</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          If an account uses <span className="font-medium text-foreground">{email}</span>, a reset link is on its way. It expires in one hour.
        </p>
        <Button asChild size="lg" className="mt-8 w-full">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
        <button onClick={() => setState("idle")} className="mt-4 w-full cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          Didn&apos;t get it? Send again
        </button>
      </div>
    );

  return (
    <div className="animate-rise">
      <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Sign in
      </Link>
      <h1 className="mt-6 type-page">Reset your password</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">Enter your account email and we&apos;ll send you a link to choose a new password.</p>
      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-4">
        <Field label="Email" id="email" error={error}>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} placeholder="you@example.com" />
        </Field>
        <Button type="submit" size="lg" disabled={state === "sending"}>
          {state === "sending" && <Loader2 className="animate-spin" />} Send reset link
        </Button>
      </form>
    </div>
  );
}

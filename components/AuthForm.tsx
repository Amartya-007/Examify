"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/firebase/client";
import { signIn, signInWithProvider, signUp } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const isDemo = process.env.NEXT_PUBLIC_EXAMIFY_DEMO === "1" && process.env.NODE_ENV !== "production";

const schema = (type: FormType) =>
  z.object({
    name: type === "sign-up" ? z.string().trim().min(2, "Enter your name (at least 2 characters).") : z.string().optional(),
    email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email, like name@example.com."),
    password:
      type === "sign-up"
        ? z.string().min(8, "Use at least 8 characters.").regex(/[0-9]|[^A-Za-z]/, "Add a number or symbol.")
        : z.string().min(1, "Enter your password."),
  });

const firebaseMessage = (code?: string) =>
  ({
    "auth/invalid-credential": "That email and password don't match. Try again or reset your password.",
    "auth/wrong-password": "That email and password don't match. Try again or reset your password.",
    "auth/user-not-found": "No account uses that email. Create one instead.",
    "auth/email-already-in-use": "An account already uses that email. Sign in instead.",
    "auth/too-many-requests": "Too many attempts. Wait a minute, then try again.",
    "auth/popup-closed-by-user": "",
    "auth/cancelled-popup-request": "",
    "auth/network-request-failed": "You seem to be offline. Check your connection.",
  })[code || ""] ?? "Something went wrong. Try again.";

export default function AuthForm({ type }: { type: FormType }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [google, setGoogle] = useState(false);
  const form = useForm<z.infer<ReturnType<typeof schema>>>({
    resolver: zodResolver(schema(type)),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onTouched",
  });
  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;
  const isSignIn = type === "sign-in";

  const finishSession = async (idToken: string, email: string) => {
    const res = await signIn({ email, idToken });
    if (res && "success" in res && res.success === false) throw new Error(res.message);
  };

  const onSubmit = async ({ name, email, password }: z.infer<ReturnType<typeof schema>>) => {
    if (isDemo) return router.push(isSignIn ? "/dashboard" : "/onboarding");
    try {
      if (isSignIn) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await finishSession(await cred.user.getIdToken(), email);
        router.push("/dashboard");
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name! }).catch(() => {});
        const res = await signUp({ uid: cred.user.uid, name: name!, email, password });
        if (!res?.success) return void toast.error(res?.message || "We couldn't create your account.");
        await finishSession(await cred.user.getIdToken(), email);
        router.push("/onboarding");
      }
      router.refresh();
    } catch (e) {
      const msg = firebaseMessage((e as { code?: string })?.code) || (e as Error)?.message;
      if (msg) form.setError("root", { message: msg });
    }
  };

  const withGoogle = async () => {
    if (isDemo) return router.push("/dashboard");
    setGoogle(true);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const u = cred.user;
      const res = await signInWithProvider({
        idToken: await u.getIdToken(),
        uid: u.uid,
        name: u.displayName || u.email?.split("@")[0] || "there",
        email: u.email || "",
        photoURL: u.photoURL,
      });
      if (!res.success) throw new Error("We couldn't sign you in with Google.");
      router.push(res.isNew || !res.onboarded ? "/onboarding" : "/dashboard");
      router.refresh();
    } catch (e) {
      const msg = firebaseMessage((e as { code?: string })?.code);
      if (msg) toast.error(msg);
    } finally {
      setGoogle(false);
    }
  };

  return (
    <div className="animate-rise">
      <h1 className="type-page">{isSignIn ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        {isSignIn ? "Sign in to pick up where you left off." : "Free to start. Your first interview takes about five minutes."}
      </p>

      <Button type="button" variant="outline" size="lg" className="mt-8 w-full" onClick={withGoogle} disabled={google || isSubmitting}>
        {google ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {!isSignIn && (
          <Field label="Full name" error={errors.name?.message} id="name">
            <Input id="name" autoComplete="name" placeholder="Aarav Mehta" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
        )}
        <Field label="Email" error={errors.email?.message} id="email">
          <Input id="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field
          label="Password"
          id="password"
          error={errors.password?.message}
          hint={!isSignIn ? "At least 8 characters, with a number or symbol." : undefined}
          action={
            isSignIn ? (
              <Link href="/forgot-password" className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                Forgot password?
              </Link>
            ) : null
          }
        >
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              aria-invalid={!!errors.password}
              className="pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        {errors.root?.message && (
          <p role="alert" className="rounded-lg bg-destructive-soft px-3 py-2.5 text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting || google}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSignIn ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignIn ? "New to Examify? " : "Already have an account? "}
        <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="font-medium text-foreground underline-offset-2 hover:underline">
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}

export function Field({ label, id, error, hint, action, children }: { label: string; id: string; error?: string; hint?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p className="text-[13px] text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.29v-3.1H1.3A12 12 0 0 0 0 12c0 1.94.46 3.77 1.3 5.39l3.99-3.1z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.3 6.61l3.99 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
    </svg>
  );
}

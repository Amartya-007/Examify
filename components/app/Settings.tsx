"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Eye, EyeOff, Loader2, LogOut, Trash2, X } from "lucide-react";
import { EmailAuthProvider, reauthenticateWithCredential, signOut as firebaseSignOut, updatePassword } from "firebase/auth";

import { auth } from "@/firebase/client";
import { deleteAccount, signOut, updateUserProfile } from "@/lib/actions/auth.action";
import { readPrefs, writePrefs, type Prefs } from "@/lib/prefs";
import { LEVELS, ROLES } from "@/lib/options";
import { Field } from "@/components/AuthForm";
import Chip from "@/components/app/Chip";
import ThemeToggle from "@/components/ThemeToggle";
import AvatarWave from "@/components/brand/AvatarWave";
import { useDevices } from "@/components/call/useMedia";
import { Avatar, AvatarFallback, AvatarImage, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings({ user, tab }: { user: User; tab: "profile" | "preferences" | "security" }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="type-page">Settings</h1>
      <Tabs defaultValue={tab} className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <Profile user={user} />
        </TabsContent>
        <TabsContent value="preferences" className="mt-6">
          <Preferences />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <Security email={user.email} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Section({ title, description, children, footer }: { title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border bg-card">
      <div className="p-6 sm:p-8">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="flex justify-end gap-2 border-t bg-surface/60 px-6 py-4 sm:px-8 rounded-b-3xl">{footer}</div>}
    </section>
  );
}

/* ---------------------------------------------------------------- Profile */

async function resizeToDataUrl(file: File, size = 192): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const s = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, (bitmap.width - s) / 2, (bitmap.height - s) / 2, s, s, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function Profile({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [photo, setPhoto] = useState<string | null>(user.profileURL || null);
  const [role, setRole] = useState(user.targetRole || "");
  const [level, setLevel] = useState(user.level || "Junior");
  const [stack, setStack] = useState((user.techstack || []).join(", "));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const onFile = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Choose an image file (JPG, PNG or WebP).");
    if (f.size > 8 * 1024 * 1024) return toast.error("That image is over 8 MB. Choose a smaller one.");
    try {
      setPhoto(await resizeToDataUrl(f));
    } catch {
      toast.error("We couldn't read that image.");
    }
  };

  const save = async () => {
    if (name.trim().length < 2) return setError("Enter a name with at least 2 characters.");
    setError("");
    setSaving(true);
    const res = await updateUserProfile({
      name: name.trim(),
      profileURL: photo,
      targetRole: role.trim(),
      level,
      techstack: stack.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8),
    });
    setSaving(false);
    if (!res.success) return void toast.error(res.message || "We couldn't save your profile.");
    toast.success("Profile saved");
    router.refresh();
  };

  return (
    <Section
      title="Profile"
      description="This is how you appear in interviews and on reports."
      footer={
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="animate-spin" />} Save changes
        </Button>
      }
    >
      <div className="flex items-center gap-8 pl-2">
        <AvatarWave size={80} halo={1.9}>
          <Avatar className="size-20 text-xl">
            {photo && <AvatarImage src={photo} alt="" />}
            <AvatarFallback className="text-xl">{initials(name)}</AvatarFallback>
          </Avatar>
        </AvatarWave>
        <div className="flex flex-wrap gap-2">
          <input ref={file} type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} aria-label="Upload photo" />
          <Button variant="outline" size="sm" onClick={() => file.current?.click()}>
            <Camera /> Upload photo
          </Button>
          {photo && (
            <Button variant="ghost" size="sm" onClick={() => setPhoto(null)}>
              <X /> Remove
            </Button>
          )}
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" id="name" error={error}>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!error} autoComplete="name" />
        </Field>
        <Field label="Email" id="email" hint="Contact support to change your email.">
          <Input id="email" value={user.email} disabled readOnly />
        </Field>
        <Field label="Target role" id="role">
          <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} list="settings-roles" placeholder="e.g. Frontend Developer" />
          <datalist id="settings-roles">
            {ROLES.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </Field>
        <Field label="Tech stack" id="stack" hint="Separate with commas. Up to 8.">
          <Input id="stack" value={stack} onChange={(e) => setStack(e.target.value)} placeholder="React, TypeScript, Node.js" />
        </Field>
      </div>
      <p className="mt-6 mb-3 text-sm font-medium">Level</p>
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <Chip key={l} selected={level === l} onClick={() => setLevel(l)}>
            {l}
          </Chip>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- Preferences */

function Preferences() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [asked, setAsked] = useState(false);
  const devices = useDevices(asked);
  useEffect(() => { setPrefs(readPrefs()); }, []);
  const set = (patch: Partial<Prefs>) => setPrefs(writePrefs(patch));

  const askAccess = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      s.getTracks().forEach((t) => t.stop());
    } catch {}
    setAsked((v) => !v);
  };

  const rows = [
    { key: "micId" as const, label: "Microphone", list: devices.mics },
    { key: "camId" as const, label: "Camera", list: devices.cams },
    { key: "speakerId" as const, label: "Speaker", list: devices.speakers },
  ];
  const labelsHidden = devices.mics.every((d) => !d.label);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Appearance">
        <ThemeToggle />
      </Section>
      <Section title="Devices" description="Used as defaults in the green room. Saved on this device.">
        <div className="grid gap-4 sm:grid-cols-3">
          {rows.map((r) => (
            <label key={r.key} className="grid gap-1.5 text-sm font-medium">
              {r.label}
              <Select value={prefs?.[r.key] && r.list.some((d) => d.deviceId === prefs[r.key]) ? prefs[r.key] : undefined} onValueChange={(v) => set({ [r.key]: v })} disabled={!r.list.length}>
                <SelectTrigger>
                  <SelectValue placeholder="System default" />
                </SelectTrigger>
                <SelectContent>
                  {r.list.map((d, i) => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label || `${r.label} ${i + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          ))}
        </div>
        {labelsHidden && (
          <Button variant="outline" size="sm" className="mt-4" onClick={askAccess}>
            Show device names
          </Button>
        )}
      </Section>
      <Section title="During interviews">
        <div className="flex flex-col divide-y">
          <ToggleRow
            label="Live captions"
            description="Show what the interviewer just said under the orb."
            checked={prefs?.captions ?? true}
            onChange={(v) => set({ captions: v })}
          />
          <ToggleRow
            label="Join with camera on"
            description="Your video stays on your device. It helps you practise eye contact."
            checked={prefs?.joinWithCamera ?? true}
            onChange={(v) => set({ joinWithCamera: v })}
          />
        </div>
      </Section>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <label htmlFor={id}>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ---------------------------------------------------------------- Security */

function Security({ email }: { email: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; next?: string }>({});
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState("");
  const providerIsGoogle = typeof window !== "undefined" && auth.currentUser?.providerData.some((p) => p.providerId === "google.com");

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!current) errs.current = "Enter your current password.";
    if (next.length < 8) errs.next = "Use at least 8 characters.";
    else if (next === current) errs.next = "Choose a password you haven't used here.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const u = auth.currentUser;
      if (!u) throw Object.assign(new Error(), { code: "auth/requires-recent-login" });
      await reauthenticateWithCredential(u, EmailAuthProvider.credential(email, current));
      await updatePassword(u, next);
      setCurrent("");
      setNext("");
      toast.success("Password updated");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") setErrors({ current: "That password isn't right." });
      else if (code === "auth/requires-recent-login") toast.error("For security, sign out and sign in again, then change your password.");
      else toast.error("We couldn't update your password. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth).catch(() => {});
    await signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const remove = async () => {
    setDeleting(true);
    const res = await deleteAccount();
    if (!res.success) {
      setDeleting(false);
      return void toast.error(res.message || "We couldn't delete your account.");
    }
    await firebaseSignOut(auth).catch(() => {});
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Password"
        description={providerIsGoogle ? "You sign in with Google, so there's no Examify password to change." : "Use at least 8 characters."}
      >
        {!providerIsGoogle && (
          <form onSubmit={change} noValidate className="grid max-w-md gap-4">
            <Field label="Current password" id="current" error={errors.current}>
              <Input id="current" type={show ? "text" : "password"} autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} aria-invalid={!!errors.current} />
            </Field>
            <Field label="New password" id="new" error={errors.next}>
              <div className="relative">
                <Input id="new" type={show ? "text" : "password"} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} aria-invalid={!!errors.next} className="pr-11" />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide passwords" : "Show passwords"} className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-accent">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" className="justify-self-start" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Update password
            </Button>
          </form>
        )}
      </Section>

      <Section title="Session" description="Sign out of Examify on this device.">
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut /> Sign out
        </Button>
      </Section>

      <section className="rounded-[28px] border border-destructive/30 bg-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-destructive">Delete account</h2>
        <p className="mt-1 max-w-lg text-sm text-muted-foreground">
          Permanently deletes your profile, every interview you created and all your reports. This can&apos;t be undone.
        </p>
        <AlertDialog onOpenChange={() => setConfirm("")}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-5">
              <Trash2 /> Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your interviews, reports and transcripts will be erased permanently. Type <span className="font-semibold text-foreground">DELETE</span> to confirm.
            </AlertDialogDescription>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-label="Type DELETE to confirm" autoComplete="off" />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={confirm !== "DELETE" || deleting}
                onClick={(e) => {
                  e.preventDefault();
                  void remove();
                }}
              >
                {deleting && <Loader2 className="animate-spin" />} Delete forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}

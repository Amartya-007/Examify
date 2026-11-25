"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FileText, Hash, LayoutGrid, Mic, MoonStar, Plus, Search, Settings, SunMedium } from "lucide-react";

export type PaletteInterview = { id: string; role: string; level: string; scored: boolean };

export function useCommandMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}

export default function CommandMenu({ open, onOpenChange, interviews }: { open: boolean; onOpenChange: (o: boolean) => void; interviews: PaletteInterview[] }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };
  const item =
    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none data-[selected=true]:bg-accent [&_svg]:size-4 [&_svg]:text-muted-foreground";
  const group = "px-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[oklch(0.1_0.04_270/0.55)] backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-label="Command menu"
          className="fixed top-[14vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">Search Examify</DialogPrimitive.Title>
          <Command loop>
            <div className="flex items-center gap-3 border-b px-4">
              <Search className="size-4 text-muted-foreground" />
              <Command.Input autoFocus placeholder="Search interviews or jump to…" className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" />
              <kbd className="rounded-md border px-1.5 py-0.5 text-[11px] text-muted-foreground">Esc</kbd>
            </div>
            <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto pb-2">
              <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing matches. Try a role or a page name.</Command.Empty>
              <Command.Group heading="Start" className={group}>
                <Command.Item className={item} onSelect={() => run(() => router.push("/interview"))}>
                  <Plus /> New interview
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => router.push("/interview/voice"))}>
                  <Mic /> Set up an interview by voice
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => router.push("/join"))}>
                  <Hash /> Join with a code
                </Command.Item>
              </Command.Group>
              {interviews.length > 0 && (
                <Command.Group heading="Your interviews" className={group}>
                  {interviews.map((i) => (
                    <Command.Item
                      key={i.id}
                      value={`${i.role} ${i.level} ${i.id}`}
                      className={item}
                      onSelect={() => run(() => router.push(i.scored ? `/interview/${i.id}/feedback` : `/interview/${i.id}`))}
                    >
                      <FileText />
                      <span className="flex-1">{i.role}</span>
                      <span className="text-xs text-muted-foreground">{i.scored ? "Open report" : "Start"}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              <Command.Group heading="Go to" className={group}>
                <Command.Item className={item} onSelect={() => run(() => router.push("/dashboard"))}>
                  <LayoutGrid /> Home
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => router.push("/settings"))}>
                  <Settings /> Settings
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}>
                  {resolvedTheme === "dark" ? <SunMedium /> : <MoonStar />} Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

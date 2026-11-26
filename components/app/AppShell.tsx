"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronsUpDown, Home, LogOut, Mic, Plus, Search, Settings, UserRound } from "lucide-react";
import { signOut as firebaseSignOut } from "firebase/auth";

import { auth } from "@/firebase/client";
import { signOut } from "@/lib/actions/auth.action";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import AvatarWave from "@/components/brand/AvatarWave";
import CommandMenu, { useCommandMenu, type PaletteInterview } from "@/components/app/CommandMenu";
import { Avatar, AvatarFallback, AvatarImage, initials } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ShellUser = { id: string; name: string; email: string; profileURL?: string };
type Report = { id: string; interviewId: string; role: string; score: number; createdAt: string };

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/interview/voice", label: "Voice setup", icon: Mic },
];

export default function AppShell({ user, reports, interviews, children }: { user: ShellUser; reports: Report[]; interviews: PaletteInterview[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const palette = useCommandMenu();
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  const handleSignOut = async () => {
    await firebaseSignOut(auth).catch(() => {});
    await signOut();
    router.push("/");
    router.refresh();
  };

  const scoreTone = (s: number) => (s >= 80 ? "text-success" : s >= 60 ? "text-brand-strong" : s >= 40 ? "text-warning" : "text-destructive");

  return (
    <div className="min-h-[100dvh] md:grid md:grid-cols-[76px_1fr] lg:grid-cols-[264px_1fr]">
      <a href="#main" className="sr-only z-50 rounded-md bg-card px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>

      {/* Sidebar: icon rail on tablet, full on desktop */}
      <aside className="no-print sticky top-0 hidden h-[100dvh] flex-col border-r bg-surface/60 md:flex">
        <div className="flex h-16 items-center px-5 lg:px-5">
          <Logo href="/dashboard" className="hidden lg:inline-flex" />
          <Link href="/dashboard" aria-label="Examify home" className="lg:hidden">
            <LogoMark className="size-8" />
          </Link>
        </div>

        <div className="flex flex-col gap-2 px-3 pt-2">
          <Link
            href="/interview"
            className="bg-magic flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium text-white shadow-[0_10px_28px_-12px_var(--magic-2)] transition hover:brightness-110 lg:justify-start lg:px-3.5"
          >
            <Plus className="size-4" />
            <span className="hidden lg:inline">New interview</span>
          </Link>
          <button
            onClick={() => palette.setOpen(true)}
            className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border bg-card px-3 text-sm text-muted-foreground transition hover:text-foreground lg:justify-start"
            aria-label="Search and commands"
          >
            <Search className="size-4" />
            <span className="hidden flex-1 text-left lg:inline">Search</span>
            <kbd className="hidden rounded-md border bg-surface px-1.5 text-[11px] lg:inline">{mac ? "⌘K" : "Ctrl K"}</kbd>
          </button>
        </div>

        <nav aria-label="Main" className="mt-6 flex flex-col gap-0.5 px-3">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Tooltip key={n.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-10 items-center justify-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground lg:justify-start",
                      active && "bg-accent text-foreground",
                    )}
                  >
                    {active && <span className="bg-magic absolute top-2 bottom-2 left-0 w-[3px] rounded-full" />}
                    <n.icon className="size-[18px]" />
                    <span className="hidden lg:inline">{n.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  {n.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {reports.length > 0 && (
          <div className="mt-8 hidden px-3 lg:block">
            <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">Recent reports</p>
            <ul className="flex flex-col gap-0.5">
              {reports.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/interview/${r.interviewId}/feedback`}
                    aria-current={pathname === `/interview/${r.interviewId}/feedback` ? "page" : undefined}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-accent aria-[current=page]:bg-accent"
                  >
                    <span className="flex-1 truncate text-muted-foreground">{r.role}</span>
                    <span className={cn("num text-xs font-semibold", scoreTone(r.score))}>{r.score}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 p-3">
          <div className="hidden lg:block">
            <ThemeToggle className="flex w-full" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl p-1.5 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring lg:justify-start lg:p-2">
              <AvatarWave size={32} halo={1.7}>
                <Avatar className="size-8">
                  {user.profileURL && <AvatarImage src={user.profileURL} alt="" />}
                  <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                </Avatar>
              </AvatarWave>
              <span className="hidden min-w-0 flex-1 lg:block">
                <span className="block truncate text-sm font-medium">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
              <ChevronsUpDown className="hidden size-4 text-muted-foreground lg:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-60">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Signed in as {user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <UserRound /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings?tab=preferences">
                  <Settings /> Preferences
                </Link>
              </DropdownMenuItem>
              <div className="px-2.5 py-2 lg:hidden">
                <ThemeToggle />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut} className="text-destructive [&_svg]:text-destructive">
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md md:hidden">
        <Logo href="/dashboard" size="sm" />
        <button onClick={() => palette.setOpen(true)} aria-label="Search" className="ml-auto grid size-9 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-accent">
          <Search className="size-[18px]" />
        </button>
        <ThemeToggle compact />
        <Link href="/settings" aria-label="Account" className="ml-1 grid size-10 place-items-center">
          <AvatarWave size={30} halo={1.45}>
            <Avatar className="size-[30px]">
              {user.profileURL && <AvatarImage src={user.profileURL} alt="" />}
              <AvatarFallback className="text-[11px]">{initials(user.name)}</AvatarFallback>
            </Avatar>
          </AvatarWave>
        </Link>
      </header>

      <main id="main" className="min-w-0 px-4 pt-6 pb-28 sm:px-6 md:px-8 md:pt-8 md:pb-14 lg:px-10">
        <div className="mx-auto max-w-[1240px]">{children}</div>
      </main>

      {/* Mobile tab bar */}
      <nav aria-label="Main" className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {[NAV[0], { href: "/interview", label: "New interview", icon: Plus, exact: true }, NAV[1], { href: "/settings", label: "Settings", icon: Settings }].map((n) => {
          const active = isActive(n.href, "exact" in n ? n.exact : false);
          return (
            <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground", active && "text-foreground")}>
              <span className={cn("grid h-7 w-12 place-items-center rounded-full", active && (n.href === "/interview" ? "bg-magic text-white" : "bg-accent"))}>
                <n.icon className="size-[18px]" />
              </span>
              {n.label === "New interview" ? "New" : n.label === "Voice setup" ? "Voice" : n.label}
            </Link>
          );
        })}
      </nav>

      <CommandMenu open={palette.open} onOpenChange={palette.setOpen} interviews={interviews} />
    </div>
  );
}

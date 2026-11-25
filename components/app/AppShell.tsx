"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CircleUserRound, Hash, LayoutGrid, LogOut, Plus, Settings } from "lucide-react";
import { signOut as firebaseSignOut } from "firebase/auth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { auth } from "@/firebase/client";
import { signOut } from "@/lib/actions/auth.action";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

dayjs.extend(relativeTime);

type ShellUser = { id: string; name: string; email: string; profileURL?: string };
type Note = { id: string; interviewId: string; score: number; createdAt: string };

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/interview", label: "New interview", icon: Plus },
  { href: "/join", label: "Join", icon: Hash },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppShell({ user, notifications, children }: { user: ShellUser; notifications: Note[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = (href: string) => (href === "/interview" ? pathname === "/interview" : pathname.startsWith(href));

  const handleSignOut = async () => {
    await firebaseSignOut(auth).catch(() => {});
    await signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#main" className="sr-only z-50 rounded-md bg-card px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <header className="no-print sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
          <Logo href="/dashboard" className="mr-4" />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.filter((n) => n.href !== "/interview").map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active(n.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground",
                  active(n.href) && "bg-accent text-foreground",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild variant="brand" size="sm" className="hidden sm:inline-flex">
              <Link href="/interview">
                <Plus /> New interview
              </Link>
            </Button>
            <Notifications items={notifications} />
            <ThemeToggle compact className="hidden sm:inline-flex" />
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 cursor-pointer rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring" aria-label="Account menu">
                <Avatar className="size-9">
                  {user.profileURL && <AvatarImage src={user.profileURL} alt="" />}
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <CircleUserRound /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings?tab=preferences">
                    <Settings /> Preferences
                  </Link>
                </DropdownMenuItem>
                <div className="px-2.5 py-2">
                  <p className="mb-2 text-xs text-muted-foreground">Theme</p>
                  <ThemeToggle />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut} className="text-destructive [&_svg]:text-destructive">
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-28 sm:px-6 md:pb-16">
        {children}
      </main>

      {/* Mobile tab bar */}
      <nav aria-label="Main" className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active(n.href) ? "page" : undefined}
            className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground", active(n.href) && "text-foreground")}
          >
            <span className={cn("grid h-7 w-12 place-items-center rounded-full", active(n.href) && (n.href === "/interview" ? "bg-brand text-brand-foreground" : "bg-accent"))}>
              <n.icon className="size-[18px]" />
            </span>
            {n.label === "New interview" ? "New" : n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Notifications({ items }: { items: Note[] }) {
  const fresh = items.filter((n) => dayjs().diff(dayjs(n.createdAt), "day") < 2).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications${fresh ? `, ${fresh} new` : ""}`} className="relative">
          <Bell />
          {fresh > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-brand ring-2 ring-background" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <p className="border-b px-4 py-3 text-sm font-semibold">Notifications</p>
        {items.length ? (
          <ul className="max-h-80 overflow-y-auto p-1">
            {items.map((n) => (
              <li key={n.id}>
                <Link href={`/interview/${n.interviewId}/feedback`} className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-accent">
                  <span className="num mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-semibold text-brand-strong">{n.score}</span>
                  <span className="text-sm">
                    Your feedback report is ready
                    <span className="block text-xs text-muted-foreground">{dayjs(n.createdAt).fromNow()}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="mt-1 text-sm text-muted-foreground">Reports show up here when they&apos;re ready.</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

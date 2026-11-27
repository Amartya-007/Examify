"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, CreditCard, LayoutDashboard, Layers, Users } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/plans", label: "Plans and pricing", icon: Layers },
];

export default function AdminShell({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = (h: string, exact?: boolean) => (exact ? pathname === h : pathname.startsWith(h));
  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[236px_1fr]">
      <aside className="sticky top-0 hidden h-[100dvh] flex-col border-r bg-surface/60 p-3 lg:flex">
        <div className="flex h-12 items-center gap-2 px-2">
          <Logo href="/admin" size="sm" />
          <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">Admin</span>
        </div>
        <nav aria-label="Admin" className="mt-6 flex flex-col gap-0.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href, n.exact) ? "page" : undefined}
              className={cn(
                "relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                active(n.href, n.exact) && "bg-accent text-foreground",
              )}
            >
              {active(n.href, n.exact) && <span className="bg-magic absolute top-2 bottom-2 left-0 w-[3px] rounded-full" />}
              <n.icon className="size-[18px]" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="flex h-10 flex-1 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <ArrowLeft className="size-4" /> Back to app
            </Link>
            <ThemeToggle compact />
          </div>
          <p className="truncate px-3 text-xs text-muted-foreground">Signed in as {user.email}</p>
        </div>
      </aside>

      {/* Tablet and phone: top bar with tabs */}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center gap-2 px-4">
          <Logo href="/admin" size="sm" />
          <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">Admin</span>
          <Link href="/dashboard" className="ml-auto inline-flex min-h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> App
          </Link>
          <ThemeToggle compact />
        </div>
        <nav aria-label="Admin" className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href, n.exact) ? "page" : undefined}
              className={cn("flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground", active(n.href, n.exact) && "bg-accent text-foreground")}
            >
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main id="main" className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[1280px]">{children}</div>
      </main>
    </div>
  );
}

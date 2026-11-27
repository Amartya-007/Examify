import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import ThemeToggle from "@/components/ThemeToggle";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-5">
          <Logo />
          <Link href="/" className="ml-auto inline-flex min-h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Home
          </Link>
          <ThemeToggle compact />
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-5 py-12 sm:py-16">{children}</main>
      <footer className="border-t">
        <nav aria-label="Legal" className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-2 px-5 py-8 text-sm text-muted-foreground">
          {[
            ["/pricing", "Pricing"],
            ["/terms", "Terms"],
            ["/privacy", "Privacy"],
            ["/refunds", "Refunds and cancellations"],
            ["/contact", "Contact"],
          ].map(([h, l]) => (
            <Link key={h} href={h} className="hover:text-foreground">
              {l}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}

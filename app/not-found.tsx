import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="num mt-12 text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 type-page">This page isn&apos;t here</h1>
      <p className="mt-2 max-w-sm text-[15px] text-muted-foreground">The link may be old, or the interview was deleted. Check the code and try again.</p>
      <div className="mt-8 flex gap-2">
        <Button asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/join">Enter a code</Link>
        </Button>
      </div>
    </div>
  );
}

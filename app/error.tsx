"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center" role="alert">
      <span className="grid size-12 place-items-center rounded-2xl bg-destructive-soft text-destructive">
        <AlertTriangle className="size-5" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-[15px] text-muted-foreground">It&apos;s on our side. Try again, and if it keeps happening, come back in a few minutes.</p>
      {error.digest && <p className="num mt-3 text-xs text-muted-foreground">Ref {error.digest}</p>}
      <div className="mt-8 flex gap-2">
        <Button onClick={reset}>
          <RotateCcw /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

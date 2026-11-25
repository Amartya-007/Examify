import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Examify mark: a rounded square holding three bars. Read one way it is an "E";
 * read the other, a voice level meter, the moment you start speaking.
 * The middle bar carries the brand accent.
 */
export function LogoMark({ className, title = "Examify" }: { className?: string; title?: string }) {
  const id = "ex-magic";
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} role="img" aria-label={title || undefined} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--magic-1)" />
          <stop offset="100%" stopColor="var(--magic-3)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <rect x="8.5" y="9" width="15" height="3.2" rx="1.6" className="fill-primary-foreground" />
      <rect x="8.5" y="14.4" width="10.5" height="3.2" rx="1.6" fill={`url(#${id})`} />
      <rect x="8.5" y="19.8" width="13" height="3.2" rx="1.6" className="fill-primary-foreground" />
    </svg>
  );
}

export function Logo({ href = "/", className, size = "md" }: { href?: string | null; className?: string; size?: "sm" | "md" | "lg" }) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={size === "lg" ? "size-10" : size === "sm" ? "size-7" : "size-8"} title="" />
      <span
        className={cn(
          "text-magic font-semibold tracking-[-0.035em]",
          size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg",
        )}
      >
        examify
      </span>
    </span>
  );
  if (!href) return inner;
  return (
    <Link href={href} aria-label="Examify home" className="rounded-md">
      {inner}
    </Link>
  );
}

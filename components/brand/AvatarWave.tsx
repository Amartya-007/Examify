"use client";

import VoiceRibbon from "@/components/brand/VoiceRibbon";
import { cn } from "@/lib/utils";

/**
 * Wraps a profile picture with a soft wave flowing behind it, inside a circular halo.
 * Pass getLevel/getPitch to make the wave follow a voice (for example in the call).
 */
export default function AvatarWave({
  size,
  halo = 1.75,
  getLevel,
  getPitch,
  className,
  children,
}: {
  size: number;
  halo?: number;
  getLevel?: () => number;
  getPitch?: () => number;
  className?: string;
  children: React.ReactNode;
}) {
  const h = Math.round(size * halo);
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full [mask-image:radial-gradient(closest-side,black_62%,transparent)]"
        style={{ width: h, height: h }}
      >
        <VoiceRibbon strands={4} amplitude={0.3} pointer={false} speed={0.8} getLevel={getLevel} getPitch={getPitch} />
      </span>
      <span className="relative rounded-full bg-card ring-2 ring-[color-mix(in_oklab,var(--magic-2)_40%,transparent)]">{children}</span>
    </span>
  );
}

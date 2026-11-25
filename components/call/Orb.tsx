"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The AI interviewer's presence. Reacts to the assistant's audio level through the
 * --level CSS variable (0-1), which the parent writes directly to avoid re-renders.
 */
const Orb = forwardRef<HTMLDivElement, { state: "idle" | "connecting" | "listening" | "speaking" | "thinking"; size?: number; className?: string }>(
  function Orb({ state, size = 168, className }, ref) {
    return (
      <div
        ref={ref}
        data-state={state}
        className={cn("group/orb relative grid place-items-center", className)}
        style={{ width: size, height: size, ["--level" as string]: 0 }}
        aria-hidden="true"
      >
        {/* halo rings scale with voice level */}
        <span className="absolute inset-0 rounded-full bg-brand/10 transition-transform duration-150 ease-out [transform:scale(calc(1+var(--level)*0.45))]" />
        <span className="absolute inset-[10%] rounded-full bg-brand/15 transition-transform duration-150 ease-out [transform:scale(calc(1+var(--level)*0.25))]" />
        <span
          className={cn(
            "relative size-[64%] rounded-full shadow-[inset_0_-10px_30px_rgba(0,0,0,.25),0_12px_40px_-8px_var(--brand)]",
            "bg-[radial-gradient(circle_at_32%_28%,oklch(0.9_0.09_60),var(--brand)_45%,var(--brand-strong)_100%)]",
            "transition-transform duration-150 ease-out [transform:scale(calc(1+var(--level)*0.12))]",
            "group-data-[state=connecting]/orb:animate-pulse group-data-[state=idle]/orb:animate-orb group-data-[state=listening]/orb:animate-orb group-data-[state=thinking]/orb:animate-orb",
          )}
        />
      </div>
    );
  },
);
export default Orb;

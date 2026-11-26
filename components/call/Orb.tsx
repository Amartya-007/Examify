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
        <span className="absolute inset-0 rounded-full bg-magic-2/12 transition-transform [transition-duration:150ms] ease-out [transform:scale(calc(1+var(--level)*0.45))]" />
        <span className="absolute inset-[10%] rounded-full bg-magic-1/15 transition-transform [transition-duration:150ms] ease-out [transform:scale(calc(1+var(--level)*0.25))]" />
        <span
          className={cn(
            "relative size-[64%] rounded-full shadow-[inset_0_-10px_30px_rgba(0,0,0,.25),0_14px_44px_-8px_var(--magic-2)]",
            "bg-[radial-gradient(circle_at_30%_26%,oklch(0.95_0.06_210),var(--magic-1)_22%,var(--magic-2)_55%,var(--magic-3)_100%)]",
            "transition-transform [transition-duration:150ms] ease-out [transform:scale(calc(1+var(--level)*0.12))]",
            "group-data-[state=connecting]/orb:animate-pulse group-data-[state=idle]/orb:animate-orb group-data-[state=listening]/orb:animate-orb group-data-[state=thinking]/orb:animate-orb",
          )}
        />
      </div>
    );
  },
);
export default Orb;

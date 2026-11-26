"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type OrbState = "idle" | "connecting" | "listening" | "speaking" | "thinking";

/**
 * The AI interviewer: a living globe. A swirling core with drifting light inside, a moving
 * highlight, and two tilted orbit rings. It reacts to the interviewer's voice through the
 * --level CSS variable (0-1), written directly by the parent to avoid re-renders, and its
 * pace follows the state (calm while listening, quicker while thinking or speaking).
 * Styles live in globals.css under "Orb".
 */
const Orb = forwardRef<HTMLDivElement, { state: OrbState; size?: number; className?: string }>(function Orb({ state, size = 168, className }, ref) {
  return (
    <div ref={ref} data-state={state} className={cn("orb", className)} style={{ width: size, height: size, ["--level" as string]: 0 }} aria-hidden="true">
      <span className="orb-glow" />
      <span className="orb-ring orb-ring-a" />
      <span className="orb-ring orb-ring-b" />
      <span className="orb-core">
        <span className="orb-swirl" />
        <span className="orb-drift orb-drift-1">
          <span className="orb-blob" />
        </span>
        <span className="orb-drift orb-drift-2">
          <span className="orb-blob" />
        </span>
        <span className="orb-drift orb-drift-3">
          <span className="orb-blob" />
        </span>
        <span className="orb-shine" />
      </span>
    </div>
  );
});
export default Orb;

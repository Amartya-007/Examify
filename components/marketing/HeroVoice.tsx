"use client";

import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import VoiceRibbon from "@/components/brand/VoiceRibbon";
import { useVoiceAnalyser } from "@/components/call/useVoice";
import { cn } from "@/lib/utils";

/** The hero wave. Tap the mic and it follows your voice: loudness and pitch. Nothing is recorded. */
export default function HeroVoice() {
  const [on, setOn] = useState(false);
  const voice = useVoiceAnalyser(on);
  const blocked = voice.permission === "denied" || voice.permission === "unsupported";
  const active = on && voice.permission === "granted";

  return (
    <div className="relative">
      <div className="h-[220px] sm:h-[280px] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <VoiceRibbon strands={7} amplitude={0.32} getLevel={active ? () => voice.level.current : undefined} getPitch={active ? () => voice.pitch.current : undefined} />
      </div>
      <div className="absolute inset-x-0 bottom-2 flex justify-center">
        <button
          onClick={() => setOn((v) => !v)}
          aria-pressed={active}
          className={cn(
            "glass flex h-11 cursor-pointer items-center gap-2.5 rounded-full px-4 text-sm font-medium transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-[3px] focus-visible:ring-ring",
            active && "ring-1 ring-[var(--magic-1)]",
          )}
        >
          <span className={cn("grid size-7 place-items-center rounded-full", active ? "bg-magic text-white" : "bg-secondary")}>
            {blocked ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
          </span>
          {active ? "Listening. Try a high and a low note" : blocked ? "Microphone blocked" : "Try it with your voice"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {active ? "The wave now follows your voice. Nothing is recorded or sent." : ""}
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import VoiceRibbon from "@/components/brand/VoiceRibbon";
import { cn } from "@/lib/utils";

/** The hero ribbon. Tap the mic and it follows your voice. Audio never leaves the page. */
export default function HeroVoice() {
  const [state, setState] = useState<"idle" | "on" | "blocked">("idle");
  const level = useRef(0);
  const stop = useRef<() => void>(() => {});

  useEffect(() => () => stop.current(), []);

  const toggle = async () => {
    if (state === "on") {
      stop.current();
      level.current = 0;
      return setState("idle");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      let raf = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        level.current = Math.min(1, Math.sqrt(sum / data.length) * 5);
        raf = requestAnimationFrame(tick);
      };
      tick();
      stop.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        ctx.close().catch(() => {});
      };
      setState("on");
    } catch {
      setState("blocked");
    }
  };

  return (
    <div className="relative">
      <div className="h-[220px] sm:h-[280px] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <VoiceRibbon strands={7} amplitude={0.32} getLevel={state === "on" ? () => level.current : undefined} />
      </div>
      <div className="absolute inset-x-0 bottom-2 flex justify-center">
        <button
          onClick={toggle}
          aria-pressed={state === "on"}
          className={cn(
            "glass flex h-11 cursor-pointer items-center gap-2.5 rounded-full px-4 text-sm font-medium transition hover:brightness-110 focus-visible:ring-[3px] focus-visible:ring-ring",
            state === "on" && "ring-1 ring-[var(--magic-1)]",
          )}
        >
          <span className={cn("grid size-7 place-items-center rounded-full", state === "on" ? "bg-magic text-white" : "bg-secondary")}>
            {state === "blocked" ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
          </span>
          {state === "on" ? "Listening. Tap to stop" : state === "blocked" ? "Microphone blocked" : "Try it with your voice"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {state === "on" ? "The ribbon is now following your microphone. Nothing is recorded or sent." : ""}
      </p>
    </div>
  );
}

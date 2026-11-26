"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Examify's signature element: ribbons of light in the brand gradient that move like a voice.
 * `getLevel` (0-1) drives the amplitude: pass a mic or assistant volume reader. Without it the
 * ribbon breathes on its own and leans toward the pointer. Pauses off-screen; static under
 * prefers-reduced-motion.
 */
export default function VoiceRibbon({
  getLevel,
  className,
  strands = 5,
  amplitude = 0.22,
  speed = 1,
  pointer = true,
}: {
  getLevel?: () => number;
  className?: string;
  strands?: number;
  amplitude?: number;
  speed?: number;
  pointer?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const levelFn = useRef(getLevel);
  levelFn.current = getLevel;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, t = 0, level = 0;
    let px = 0.5, py = 0.5, tx = 0.5, ty = 0.5;
    let colors = ["#3fd0f5", "#4f6ef7", "#9a6bff"];

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      colors = ["--magic-1", "--magic-2", "--magic-3"].map((v) => cs.getPropertyValue(v).trim() || "#4f6ef7");
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const target = levelFn.current ? Math.min(1, Math.max(0, levelFn.current())) : 0.18 + 0.1 * Math.sin(t * 0.7);
      level += (target - level) * 0.18;
      px += (tx - px) * 0.05;
      py += (ty - py) * 0.05;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      const fallback = ["#3fd0f5", "#4f6ef7", "#9a6bff"];
      [0, 0.5, 1].forEach((o, i) => {
        try {
          grad.addColorStop(o, colors[i]);
        } catch {
          grad.addColorStop(o, fallback[i]);
        }
      });
      ctx.globalCompositeOperation = "lighter";
      const mid = h * (0.5 + (py - 0.5) * 0.18);
      for (let s = 0; s < strands; s++) {
        const k = s / Math.max(1, strands - 1);
        const amp = h * amplitude * (0.35 + level * 1.4) * (1 - Math.abs(k - 0.5) * 0.9);
        const freq = 1.4 + k * 1.1;
        const phase = t * (0.9 + k * 0.6) * speed + s * 1.7;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const u = x / w;
          // envelope: ribbon swells near the pointer and fades at the edges
          const env = Math.sin(Math.PI * u) ** 1.4 * (0.6 + 0.8 * Math.exp(-(((u - px) * 2.4) ** 2)));
          const y = mid + Math.sin(u * Math.PI * 2 * freq + phase) * amp * env + Math.sin(u * 9 + phase * 1.3) * amp * 0.12 * env;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2 + (1 - Math.abs(k - 0.5) * 2) * 2.2;
        ctx.globalAlpha = 0.35 + (1 - Math.abs(k - 0.5) * 2) * 0.5;
        ctx.shadowColor = colors[1].startsWith("oklch") || colors[1].startsWith("#") ? colors[1] : "#4f6ef7";
        ctx.shadowBlur = 18;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = () => {
      t += 0.016;
      draw();
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    };

    readColors();
    resize();
    loop();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      readColors();
      if (reduce) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      ty = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    };
    if (pointer) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [strands, amplitude, speed, pointer]);

  return (
    <div aria-hidden="true" className={cn("pointer-events-none relative size-full min-w-0 overflow-hidden", className)}>
      <canvas ref={ref} className="absolute inset-0 block size-full" />
    </div>
  );
}

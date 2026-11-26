"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal carousel that makes scrolling obvious: faded edges where more content is,
 * glass arrow buttons, a gradient progress bar, a one-time nudge when it first comes into
 * view, drag to scroll with a mouse, and arrow-key support. Cards settle in as they
 * reach the centre (CSS scroll-driven animation where supported).
 */
export default function Carousel({ label, children, itemClassName }: { label: string; children: React.ReactNode; itemClassName?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ start: true, end: false, progress: 0, thumb: 1 });
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft >= max - 2,
      progress: max > 0 ? el.scrollLeft / max : 0,
      thumb: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1,
    });
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // One-time nudge so people see the row moves.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || reduce || el.scrollWidth <= el.clientWidth) return;
        io.disconnect();
        el.scrollTo({ left: 90, behavior: "smooth" });
        timer = setTimeout(() => el.scrollTo({ left: 0, behavior: "smooth" }), 650);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
      clearTimeout(timer);
    };
  }, [update]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const fadeL = state.start ? "0px" : "56px";
  const fadeR = state.end ? "0px" : "56px";

  return (
    <div className="group/carousel relative">
      <div
        ref={track}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onScroll={update}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            page(e.key === "ArrowRight" ? 1 : -1);
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !track.current) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4) {
            d.moved = true;
            track.current.style.scrollSnapType = "none";
            track.current.scrollLeft = d.left - dx;
          }
        }}
        onPointerUp={() => {
          if (track.current) track.current.style.scrollSnapType = "";
          setTimeout(() => (drag.current = null), 0);
        }}
        onPointerLeave={() => {
          if (track.current) track.current.style.scrollSnapType = "";
          drag.current = null;
        }}
        onClickCapture={(e) => {
          if (drag.current?.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pt-1 pb-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring rounded-[28px]"
        style={{
          maskImage: `linear-gradient(to right, transparent 0, black ${fadeL}, black calc(100% - ${fadeR}), transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to right, transparent 0, black ${fadeL}, black calc(100% - ${fadeR}), transparent 100%)`,
          transition: "mask-image 200ms",
        }}
      >
        {Children.map(children, (child, i) => (
          <div key={i} className={cn("carousel-item shrink-0 snap-start", itemClassName)}>
            {child}
          </div>
        ))}
      </div>

      {/* Arrows: on the edges, only where there is more to see */}
      {(["left", "right"] as const).map((side) => {
        const hidden = side === "left" ? state.start : state.end;
        return (
          <button
            key={side}
            type="button"
            onClick={() => page(side === "left" ? -1 : 1)}
            aria-label={side === "left" ? "Previous interviews" : "More interviews"}
            disabled={hidden}
            className={cn(
              "carousel-arrow glass absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full sm:grid",
              side === "left" ? "-left-3" : "-right-3",
              hidden && "pointer-events-none opacity-0",
            )}
          >
            {side === "left" ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
          </button>
        );
      })}

      {/* Progress */}
      {state.thumb < 0.999 && (
        <div className="mx-auto mt-3 h-1 w-40 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div
            className="bg-magic h-full rounded-full transition-[margin] [transition-duration:150ms]"
            style={{ width: `${Math.max(18, state.thumb * 100)}%`, marginLeft: `${state.progress * (100 - Math.max(18, state.thumb * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}

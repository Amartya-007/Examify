"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

/*
 * Small SVG charts for the admin dashboard. One y-axis each, recessive grid, thin marks,
 * 4px rounded bar tops, 2px lines, hover crosshair/tooltip, and a legend + direct end
 * labels when there are two series. Colours: --series-a / --series-b (validated).
 */

const H = 220;

/** Measures the chart box so 1 SVG unit = 1 CSS px: labels stay 11px on phones. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, W: w };
}
const PAD = { l: 44, r: 56, t: 12, b: 26 };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}
const fmtShort = (v: number) => (v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v >= 1e3 ? `${(v / 1e3).toFixed(v >= 1e4 ? 0 : 1)}k` : `${Math.round(v)}`);

type Point = { date: string; [k: string]: number | string };

function useHover(n: number, W: number) {
  const ref = useRef<SVGSVGElement>(null);
  const [i, setI] = useState<number | null>(null);
  const onMove = (e: React.PointerEvent) => {
    const svg = ref.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const step = (W - PAD.l - PAD.r) / Math.max(1, n - 1);
    setI(Math.max(0, Math.min(n - 1, Math.round((x - PAD.l) / step))));
  };
  return { ref, i, onMove, clear: () => setI(null) };
}

function Axis({ max, prefix = "", W }: { max: number; prefix?: string; W: number }) {
  const ticks = [0, 0.5, 1].map((f) => f * max);
  return (
    <g>
      {ticks.map((t) => {
        const y = PAD.t + (H - PAD.t - PAD.b) * (1 - t / max);
        return (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" />
            <text x={PAD.l - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="var(--muted-foreground)">
              {prefix}
              {fmtShort(t)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function XLabels({ data, W }: { data: Point[]; W: number }) {
  const n = data.length;
  const idx = [0, Math.floor((n - 1) / 2), n - 1];
  const step = (W - PAD.l - PAD.r) / Math.max(1, n - 1);
  return (
    <g>
      {idx.map((k, j) => (
        <text key={k} x={PAD.l + k * step} y={H - 6} fontSize="11" fill="var(--muted-foreground)" textAnchor={j === 0 ? "start" : j === 2 ? "end" : "middle"}>
          {dayjs(data[k].date).format("D MMM")}
        </text>
      ))}
    </g>
  );
}

function Tooltip({ x, lines, title, W }: { x: number; W: number; title: string; lines: { label: string; value: string; color?: string }[] }) {
  const left = `${(x / W) * 100}%`;
  return (
    <div
      className="pointer-events-none absolute top-2 z-10 min-w-36 -translate-x-1/2 rounded-xl border bg-popover px-3 py-2 text-xs shadow-lg"
      style={{ left: `clamp(80px, ${left}, calc(100% - 80px))` }}
      role="status"
    >
      <p className="font-medium">{title}</p>
      {lines.map((l) => (
        <p key={l.label} className="mt-1 flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {l.color && <span className="size-2 rounded-full" style={{ background: l.color }} />}
            {l.label}
          </span>
          <span className="num font-semibold">{l.value}</span>
        </p>
      ))}
    </div>
  );
}

/** Daily bars for one measure (e.g. revenue). */
export function BarChart({ data, k, label, format }: { data: Point[]; k: string; label: string; format: (v: number) => string }) {
  const { ref: box, W } = useWidth();
  const n = data.length;
  const max = niceMax(Math.max(...data.map((d) => Number(d[k]))));
  const plotW = W - PAD.l - PAD.r;
  const step = plotW / Math.max(1, n - 1);
  const bw = Math.max(3, Math.min(18, (plotW / n) * 0.62));
  const h = useHover(n, W);
  return (
    <div className="relative" ref={box}>
      <svg ref={h.ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" role="img" aria-label={`${label} per day`} onPointerMove={h.onMove} onPointerLeave={h.clear}>
        <Axis W={W} max={max} prefix={label.toLowerCase().includes("revenue") ? "₹" : ""} />
        {data.map((d, i) => {
          const v = Number(d[k]);
          const bh = ((H - PAD.t - PAD.b) * v) / max;
          const x = PAD.l + i * step - bw / 2;
          const y = H - PAD.b - bh;
          return (
            <path
              key={d.date}
              d={bh < 1 ? "" : `M${x},${H - PAD.b} V${y + Math.min(4, bh)} Q${x},${y} ${x + Math.min(4, bw / 2)},${y} H${x + bw - Math.min(4, bw / 2)} Q${x + bw},${y} ${x + bw},${y + Math.min(4, bh)} V${H - PAD.b} Z`}
              fill="var(--series-a)"
              opacity={h.i === null || h.i === i ? 1 : 0.45}
            />
          );
        })}
        <XLabels W={W} data={data} />
      </svg>
      {h.i !== null && <Tooltip W={W} x={PAD.l + h.i * step} title={dayjs(data[h.i].date).format("ddd, D MMM")} lines={[{ label, value: format(Number(data[h.i][k])), color: "var(--series-a)" }]} />}
    </div>
  );
}

/** Two series on one axis (same unit), with legend, direct end labels and a crosshair. */
export function LineChart({ data, series }: { data: Point[]; series: { k: string; label: string; color: string }[] }) {
  const { ref: box, W } = useWidth();
  const n = data.length;
  const max = niceMax(Math.max(...series.flatMap((s) => data.map((d) => Number(d[s.k])))));
  const step = (W - PAD.l - PAD.r) / Math.max(1, n - 1);
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  const h = useHover(n, W);
  const paths = useMemo(
    () => series.map((s) => data.map((d, i) => `${i ? "L" : "M"}${(PAD.l + i * step).toFixed(1)},${y(Number(d[s.k])).toFixed(1)}`).join(" ")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, series, max, W],
  );
  return (
    <div>
      <ul className={cn("mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground", series.length < 2 && "sr-only")} aria-label="Legend">
        {series.map((s) => (
          <li key={s.k} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} /> {s.label}
          </li>
        ))}
      </ul>
      <div className="relative" ref={box}>
        <svg ref={h.ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" role="img" aria-label={series.map((s) => s.label).join(" and ") + " per day"} onPointerMove={h.onMove} onPointerLeave={h.clear}>
          <Axis W={W} max={max} />
          {h.i !== null && <line x1={PAD.l + h.i * step} x2={PAD.l + h.i * step} y1={PAD.t} y2={H - PAD.b} stroke="var(--muted-foreground)" strokeWidth="1" strokeDasharray="3 3" />}
          {series.map((s, j) => (
            <path key={s.k} d={paths[j]} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {series.map((s) => {
            const last = Number(data[n - 1][s.k]);
            return (
              <g key={s.k}>
                <circle cx={PAD.l + (n - 1) * step} cy={y(last)} r="4" fill={s.color} stroke="var(--card)" strokeWidth="2" />
                <text x={PAD.l + (n - 1) * step + 8} y={y(last)} dominantBaseline="middle" fontSize="11" fill="var(--foreground)">
                  {fmtShort(last)}
                </text>
              </g>
            );
          })}
          {h.i !== null &&
            series.map((s) => <circle key={s.k} cx={PAD.l + h.i! * step} cy={y(Number(data[h.i!][s.k]))} r="4" fill={s.color} stroke="var(--card)" strokeWidth="2" />)}
          <XLabels W={W} data={data} />
        </svg>
        {h.i !== null && (
          <Tooltip
            W={W}
            x={PAD.l + h.i * step}
            title={dayjs(data[h.i].date).format("ddd, D MMM")}
            lines={series.map((s) => ({ label: s.label, value: Number(data[h.i!][s.k]).toLocaleString(), color: s.color }))}
          />
        )}
      </div>
    </div>
  );
}

/** Horizontal bars for a few categories (e.g. plan mix). Values labelled directly. */
export function HBars({ rows, format = (v) => v.toLocaleString() }: { rows: { label: string; value: number; hint?: string }[]; format?: (v: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <li key={r.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} title={r.hint}>
          <div className="flex items-baseline justify-between text-sm">
            <span>{r.label}</span>
            <span className="num font-semibold">{format(r.value)}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-opacity", hover !== null && hover !== i && "opacity-45")} style={{ width: `${(r.value / max) * 100}%`, background: "var(--series-a)" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

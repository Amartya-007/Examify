import { cn, scoreLabel } from "@/lib/utils";

/** Semi-circular score gauge, 0-100. Pure SVG, server-renderable. */
export default function ScoreGauge({ score, size = 220, className }: { score: number; size?: number; className?: string }) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const r = 80;
  const len = Math.PI * r;
  const tone = s >= 80 ? "var(--success)" : s >= 60 ? "var(--brand)" : s >= 40 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size * 0.62 }}>
      <svg viewBox="0 0 200 118" className="size-full" role="img" aria-label={`Overall score ${s} out of 100`}>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke={tone}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - s / 100)}
          className="transition-[stroke-dashoffset] [transition-duration:1000ms] ease-out"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="num leading-none font-semibold tracking-tight" style={{ fontSize: size * 0.21 }}>{s}</span>
        <span className="mt-1 text-muted-foreground" style={{ fontSize: Math.max(11, size * 0.062) }}>{scoreLabel(s)} · out of 100</span>
      </div>
    </div>
  );
}

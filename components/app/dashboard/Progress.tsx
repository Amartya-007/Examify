import { Flame, Trophy } from "lucide-react";

/** Score trend, oldest to newest. A sentence first, then the line. */
export default function Progress({ scores, average, completed, streak }: { scores: { score: number; date: string }[]; average: number | null; completed: number; streak: number }) {
  const n = scores.length;
  const delta = n > 1 ? scores[n - 1].score - scores[0].score : 0;
  const W = 320, H = 96, pad = 6;
  const min = Math.min(40, ...scores.map((s) => s.score)), max = 100;
  const pts = scores.map((s, i) => [pad + (i * (W - pad * 2)) / Math.max(1, n - 1), H - pad - ((s.score - min) / (max - min)) * (H - pad * 2)] as const);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = n > 1 ? `${line} L${pts[n - 1][0]} ${H} L${pts[0][0]} ${H} Z` : "";

  return (
    <section aria-labelledby="progress" className="flex flex-col rounded-[28px] border bg-card p-6">
      <h2 id="progress" className="font-sans text-sm font-medium text-muted-foreground">
        Your progress
      </h2>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="num text-5xl font-semibold tracking-tight">{average ?? "–"}</span>
        <span className="text-sm text-muted-foreground">average score</span>
      </div>
      <p className="mt-2 text-sm">
        {n > 1 ? (
          delta >= 0 ? (
            <>
              Up <span className="num font-semibold text-success">{delta}</span> points since your first report.
            </>
          ) : (
            <>
              Down <span className="num font-semibold text-warning">{Math.abs(delta)}</span> points since your first report.
            </>
          )
        ) : (
          "Your trend appears after two reports."
        )}
      </p>
      {n > 1 && (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-auto h-24 w-full pt-4" role="img" aria-label={`Scores over time: ${scores.map((s) => s.score).join(", ")}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--magic-2)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--magic-2)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trend-line" x1="0" x2="1">
              <stop offset="0" stopColor="var(--magic-1)" />
              <stop offset="1" stopColor="var(--magic-3)" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#trend-fill)" />
          <path d={line} fill="none" stroke="url(#trend-line)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      <dl className="grid grid-cols-2 gap-3 pt-5">
        <div className="rounded-2xl bg-surface p-3.5">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Trophy className="size-3.5" /> Completed
          </dt>
          <dd className="num mt-1 text-xl font-semibold">{completed}</dd>
        </div>
        <div className="rounded-2xl bg-surface p-3.5">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="size-3.5" /> Day streak
          </dt>
          <dd className="num mt-1 text-xl font-semibold">{streak}</dd>
        </div>
      </dl>
    </section>
  );
}

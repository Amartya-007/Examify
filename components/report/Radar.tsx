import { shortCategory } from "@/lib/stats";

/** Five-axis radar chart for the category scores. */
export default function Radar({ categories, size = 280 }: { categories: Feedback["categoryScores"]; size?: number }) {
  const n = categories.length || 5;
  const cx = 150, cy = 140, R = 96;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v] as const;
  };
  const ring = (v: number) => categories.map((_, i) => pt(i, v).join(",")).join(" ");
  const shape = categories.map((c, i) => pt(i, c.score / 100).join(",")).join(" ");
  return (
    <svg viewBox="-30 0 360 280" width={size} height={(size * 280) / 300} role="img" aria-label="Category scores radar chart" className="max-w-full">
      {[0.25, 0.5, 0.75, 1].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {categories.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
      })}
      <polygon points={shape} fill="var(--brand)" fillOpacity="0.16" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" />
      {categories.map((c, i) => {
        const [x, y] = pt(i, c.score / 100);
        return <circle key={c.name} cx={x} cy={y} r="3.5" fill="var(--card)" stroke="var(--brand)" strokeWidth="2" />;
      })}
      {categories.map((c, i) => {
        const [x, y] = pt(i, 1.22);
        const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
        return (
          <text key={c.name} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize="11" fill="var(--muted-foreground)">
            {shortCategory(c.name)}
          </text>
        );
      })}
    </svg>
  );
}

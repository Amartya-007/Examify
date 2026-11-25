import { shortCategory } from "@/lib/stats";
import { cn } from "@/lib/utils";

export default function SkillMap({ skills }: { skills: { name: string; score: number }[] }) {
  if (!skills.length)
    return (
      <section className="rounded-[28px] border bg-card p-6">
        <h2 className="font-sans text-sm font-medium text-muted-foreground">Skill map</h2>
        <p className="mt-3 text-sm text-muted-foreground">Your five skill scores show up here after your first report.</p>
      </section>
    );
  const sorted = [...skills].sort((a, b) => b.score - a.score);
  const weakest = sorted[sorted.length - 1].name;
  return (
    <section aria-labelledby="skills" className="rounded-[28px] border bg-card p-6">
      <h2 id="skills" className="font-sans text-sm font-medium text-muted-foreground">
        Skill map
      </h2>
      <p className="mt-2 text-sm">
        Strongest in <span className="font-semibold">{shortCategory(sorted[0].name).toLowerCase()}</span>. Focus on{" "}
        <span className="font-semibold">{shortCategory(weakest).toLowerCase()}</span> next.
      </p>
      <ul className="mt-5 flex flex-col gap-4">
        {sorted.map((s) => (
          <li key={s.name}>
            <div className="flex items-baseline justify-between text-sm">
              <span className={cn(s.name === weakest && "font-medium text-warning")}>{shortCategory(s.name)}</span>
              <span className="num text-muted-foreground">{s.score}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full", s.name === weakest ? "bg-warning" : "bg-magic")} style={{ width: `${s.score}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

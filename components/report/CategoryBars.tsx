import { shortCategory } from "@/lib/stats";
import { cn } from "@/lib/utils";

export default function CategoryBars({ categories, showComments = true, className }: {
  categories: Feedback["categoryScores"];
  showComments?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-5", className)}>
      {categories.map((c) => {
        const tone = c.score >= 80 ? "bg-success" : c.score >= 60 ? "bg-brand" : c.score >= 40 ? "bg-warning" : "bg-destructive";
        return (
          <li key={c.name}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">{shortCategory(c.name)}</span>
              <span className="num text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{c.score}</span>/100
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={c.score} aria-valuemin={0} aria-valuemax={100} aria-label={shortCategory(c.name)}>
              <div className={cn("h-full rounded-full transition-[width] duration-700", tone)} style={{ width: `${c.score}%` }} />
            </div>
            {showComments && c.comment && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.comment}</p>}
          </li>
        );
      })}
    </ul>
  );
}

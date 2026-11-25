export type DashboardStats = {
  completed: number;
  average: number | null;
  strongest: { name: string; score: number } | null;
  streak: number;
};

const day = (iso: string) => new Date(iso).toISOString().slice(0, 10);

export function computeStats(feedbacks: Feedback[]): DashboardStats {
  const completed = feedbacks.length;
  const average = completed ? Math.round(feedbacks.reduce((s, f) => s + (f.totalScore || 0), 0) / completed) : null;

  const totals = new Map<string, { sum: number; n: number }>();
  for (const f of feedbacks)
    for (const c of f.categoryScores || []) {
      const t = totals.get(c.name) || { sum: 0, n: 0 };
      totals.set(c.name, { sum: t.sum + c.score, n: t.n + 1 });
    }
  let strongest: DashboardStats["strongest"] = null;
  for (const [name, { sum, n }] of totals) {
    const score = Math.round(sum / n);
    if (!strongest || score > strongest.score) strongest = { name, score };
  }

  // Streak: consecutive days with at least one completed interview, ending today or yesterday.
  const days = new Set(feedbacks.filter((f) => f.createdAt).map((f) => day(f.createdAt)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(day(cursor.toISOString()))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(day(cursor.toISOString()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { completed, average, strongest, streak };
}

export const shortCategory = (name: string) =>
  ({
    "Communication Skills": "Communication",
    "Technical Knowledge": "Technical",
    "Problem Solving": "Problem solving",
    "Cultural Fit": "Role fit",
    "Confidence and Clarity": "Confidence",
  })[name] || name;

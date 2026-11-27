/**
 * Layout for policy pages. Text marked with <Fill> is a placeholder the business must
 * replace with its own details before going live (Razorpay reviews these pages).
 */
export function Fill({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-warning-soft px-1 text-warning">[{children}]</mark>;
}

export default function LegalDoc({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="max-w-[68ch]">
      <h1 className="type-page">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
      <div className="mt-4 rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--warning)_45%,var(--border))] bg-warning-soft px-4 py-3 text-sm">
        Template. Replace every highlighted <Fill>placeholder</Fill> with your business details and have it reviewed before going live.
      </div>
      <div className="legal-prose mt-10">{children}</div>
    </article>
  );
}

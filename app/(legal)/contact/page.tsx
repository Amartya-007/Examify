import { Mail, MapPin, Phone } from "lucide-react";
import { Fill } from "@/components/marketing/LegalDoc";
export const metadata = { title: "Contact" };
export default function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="type-page">Contact us</h1>
      <p className="mt-3 text-[16px] text-muted-foreground">We reply within one working day.</p>
      <div className="mt-4 rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--warning)_45%,var(--border))] bg-warning-soft px-4 py-3 text-sm">
        Template. Replace the highlighted details before going live.
      </div>
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Mail, label: "Email", value: <Fill>support email</Fill> },
          { icon: Phone, label: "Phone", value: <Fill>phone number</Fill> },
          { icon: MapPin, label: "Address", value: <Fill>registered address</Fill> },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-5">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <c.icon className="size-4" /> {c.label}
            </dt>
            <dd className="mt-2 text-[15px]">{c.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-sm text-muted-foreground">
        Operated by <Fill>legal business name</Fill>.
      </p>
    </div>
  );
}

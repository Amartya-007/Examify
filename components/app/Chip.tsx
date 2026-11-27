"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Chip({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition outline-none focus-visible:ring-[3px] focus-visible:ring-ring active:scale-[0.98]",
        selected ? "border-foreground bg-foreground text-background" : "bg-card text-foreground hover:border-foreground/40",
        className,
      )}
    >
      {selected && <Check className="size-3.5" />}
      {children}
    </button>
  );
}

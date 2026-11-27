"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { LayoutGrid, List, SearchX } from "lucide-react";

import { cn } from "@/lib/utils";
import InterviewCard, { ScoreRing, typeLabel } from "@/components/app/InterviewCard";
import TechIcons from "@/components/TechIcons";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Item = { interview: Interview; feedback: Feedback | null };
const TABS = ["All", "Technical", "Behavioral", "Mixed"] as const;

export default function InterviewList({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof TABS)[number]>("All");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"list" | "cards">("list");

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: items.length, Technical: 0, Behavioral: 0, Mixed: 0 };
    items.forEach(({ interview }) => (c[typeLabel(interview.type)] = (c[typeLabel(interview.type)] || 0) + 1));
    return c;
  }, [items]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter(({ interview: i }) => !needle || [i.role, i.level, ...(i.techstack || [])].join(" ").toLowerCase().includes(needle))
      .filter(({ interview: i }) => type === "All" || typeLabel(i.type) === type)
      .sort((a, b) =>
        sort === "score"
          ? (b.feedback?.totalScore ?? -1) - (a.feedback?.totalScore ?? -1)
          : sort === "todo"
            ? Number(!!a.feedback) - Number(!!b.feedback)
            : (b.feedback?.createdAt || b.interview.createdAt).localeCompare(a.feedback?.createdAt || a.interview.createdAt),
      );
  }, [items, q, type, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b pb-3">
        <div role="tablist" aria-label="Filter by type" className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={type === t}
              onClick={() => setType(t)}
              className={cn(
                "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground",
                type === t && "bg-accent text-foreground",
              )}
            >
              {t}
              <span className="num text-xs text-muted-foreground">{counts[t] || 0}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="Sort" className="h-9 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Most recent</SelectItem>
              <SelectItem value="score">Highest score</SelectItem>
              <SelectItem value="todo">Not taken first</SelectItem>
            </SelectContent>
          </Select>
          <div role="group" aria-label="View" className="hidden rounded-lg border p-0.5 sm:flex">
            {(["list", "cards"] as const).map((v) => (
              <button
                key={v}
                aria-pressed={view === v}
                aria-label={v === "list" ? "List view" : "Card view"}
                onClick={() => setView(v)}
                className={cn("grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground", view === v && "bg-accent text-foreground")}
              >
                {v === "list" ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!shown.length ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <SearchX className="size-6 text-muted-foreground" />
          <p className="mt-3 font-medium">No interviews match</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another search or show all types.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => (setQ(""), setType("All"))}>
            Clear filters
          </Button>
        </div>
      ) : view === "cards" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {shown.map(({ interview, feedback }) => (
            <InterviewCard key={interview.id} interview={interview} feedback={feedback} />
          ))}
        </div>
      ) : (
        <ul className="divide-y">
          {shown.map(({ interview: i, feedback: f }) => {
            const href = f ? `/interview/${i.id}/feedback` : `/interview/${i.id}`;
            return (
              <li key={i.id} className="group relative -mx-3 flex items-center gap-4 rounded-2xl px-3 py-4 transition hover:bg-accent/60">
                <div className="min-w-0 flex-1">
                  <Link href={href} className="font-medium outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring">
                    {i.role}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {typeLabel(i.type)}, {i.level.toLowerCase()}, {i.questions.length} questions
                  </p>
                </div>
                <TechIcons techStack={i.techstack} max={3} className="hidden md:flex" />
                <span className="hidden w-20 text-right text-sm text-muted-foreground sm:block">{dayjs(f?.createdAt || i.createdAt).format("D MMM")}</span>
                <div className="grid w-14 place-items-center">
                  {f ? <ScoreRing score={f.totalScore} size={44} /> : <span className="rounded-full border border-dashed px-2 py-0.5 text-[11px] text-muted-foreground">New</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

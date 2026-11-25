"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";

import InterviewCard from "@/components/app/InterviewCard";
import Chip from "@/components/app/Chip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Item = { interview: Interview; feedback: Feedback | null };
const TYPES = ["All", "Technical", "Behavioral", "Mixed"] as const;

export default function InterviewList({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter(({ interview: i }) => !needle || [i.role, i.level, ...(i.techstack || [])].join(" ").toLowerCase().includes(needle))
      .filter(({ interview: i }) => type === "All" || (type === "Mixed" ? /mix/i.test(i.type) : i.type === type))
      .filter(({ feedback }) => status === "all" || (status === "scored" ? !!feedback : !feedback))
      .sort((a, b) =>
        sort === "score"
          ? (b.feedback?.totalScore ?? -1) - (a.feedback?.totalScore ?? -1)
          : (b.feedback?.createdAt || b.interview.createdAt).localeCompare(a.feedback?.createdAt || a.interview.createdAt),
      );
  }, [items, q, type, status, sort]);

  const reset = () => {
    setQ("");
    setType("All");
    setStatus("all");
  };

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search role or tech" aria-label="Search interviews" className="h-10 pl-9 text-sm" />
        </div>
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="group" aria-label="Filter by type">
          {TYPES.map((t) => (
            <Chip key={t} selected={type === t} onClick={() => setType(t)} className="h-8 shrink-0 px-3 text-[13px]">
              {t}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 lg:ml-auto">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Status" className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="scored">Scored</SelectItem>
              <SelectItem value="todo">Not taken</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="Sort" className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="score">Highest score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {shown.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map(({ interview, feedback }) => (
            <InterviewCard key={interview.id} interview={interview} feedback={feedback} />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed px-6 py-12 text-center">
          <SearchX className="size-6 text-muted-foreground" />
          <p className="mt-3 font-medium">No interviews match</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another search or clear the filters.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

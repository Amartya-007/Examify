import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6" aria-busy="true" aria-label="Loading report">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-56 rounded-[28px]" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-96 rounded-[28px]" />
        <Skeleton className="h-96 rounded-[28px]" />
      </div>
    </div>
  );
}

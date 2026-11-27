import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="hidden h-10 w-40 sm:block" />
      </div>
      <Skeleton className="h-[116px] rounded-2xl" />
      <div>
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[232px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

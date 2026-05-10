import { Skeleton } from "@/components/ui/skeleton";

export default function StatCardSkeleton() {
  return (
    <div className="bg-white border border-border p-8 rounded-2xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-9 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}

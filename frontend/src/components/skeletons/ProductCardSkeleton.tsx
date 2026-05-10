import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="mb-3 h-6 w-3/4" />
        <div className="mb-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

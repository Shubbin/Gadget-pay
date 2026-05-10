import { Skeleton } from "@/components/ui/skeleton";

export default function VirtualCardSkeleton() {
  return (
    <div className="w-full max-w-[420px] space-y-8">
      {/* Front Side Skeleton */}
      <div className="relative w-full aspect-[1.58/1] rounded-[2.5rem] bg-slate-900 border border-white/10 p-10 overflow-hidden">
        <div className="h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
                <Skeleton className="h-3 w-32 bg-white/10" />
              </div>
              <Skeleton className="h-2 w-24 bg-white/5" />
            </div>
            <Skeleton className="h-10 w-14 rounded-lg bg-white/10" />
          </div>
          
          <div className="space-y-6">
            <Skeleton className="h-6 w-3/4 bg-white/20" />
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <Skeleton className="h-2 w-12 bg-white/10" />
                <Skeleton className="h-4 w-24 bg-white/20" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-2 w-12 bg-white/10 ml-auto" />
                <Skeleton className="h-6 w-20 bg-white/20 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Balance Box Skeleton */}
      <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white border border-border shadow-sm">
        <div className="flex items-center gap-5">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div>
            <Skeleton className="h-2 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <Skeleton className="h-3 w-40 rounded-full" />
      </div>
    </div>
  );
}

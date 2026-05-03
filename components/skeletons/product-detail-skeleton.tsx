import { Skeleton } from "@/components/ui/skeleton"

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Gallery skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      </div>

      {/* Product info skeleton */}
      <div className="flex flex-col space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export default function ShippingReturnsLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Skeleton className="h-10 w-3/4 mx-auto mb-8" />

      <div className="space-y-6">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>

      <div className="space-y-6 mt-12">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}

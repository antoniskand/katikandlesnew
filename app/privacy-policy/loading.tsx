import { Skeleton } from "@/components/ui/skeleton"

export default function PrivacyPolicyLoading() {
  return (
    <div className="w-full pt-32 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Skeleton className="h-12 w-64 mb-8" />

        <div className="space-y-4 mb-16">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />

          <Skeleton className="h-8 w-48 mt-8" />

          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />

          <Skeleton className="h-8 w-48 mt-8" />

          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />

          <Skeleton className="h-8 w-64 mt-8" />

          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    </div>
  )
}

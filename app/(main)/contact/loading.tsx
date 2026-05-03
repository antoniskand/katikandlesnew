import { Skeleton } from "@/components/ui/skeleton"

export default function ContactLoading() {
  return (
    <main className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Contact Information Skeleton */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-6">
                <div className="flex items-start">
                  <Skeleton className="h-6 w-6 mr-4" />
                  <div className="w-full">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="flex items-start">
                  <Skeleton className="h-6 w-6 mr-4" />
                  <div className="w-full">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="flex items-start">
                  <Skeleton className="h-6 w-6 mr-4" />
                  <div className="w-full">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32 mt-1" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <Skeleton className="h-8 w-32 mb-6" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex space-x-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Loading() {
  return (
    <main className="pt-32 pb-24 min-h-screen">
      {" "}
      {/* Added padding top for header and padding bottom for footer */}
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    </main>
  )
}

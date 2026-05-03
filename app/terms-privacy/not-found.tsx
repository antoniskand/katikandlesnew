import Link from "next/link"

export default function NotFound() {
  return (
    <main className="pt-32 pb-24 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="mb-8 text-gray-600">Sorry, we couldn't find the terms and privacy page.</p>
        <Link href="/" className="text-coral hover:underline">
          Return to Home
        </Link>
      </div>
    </main>
  )
}

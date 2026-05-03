import Link from "next/link"

export default function NotFound() {
  return (
    <main className="pt-32 pb-24 min-h-screen bg-[#f7e7ce] flex items-center justify-center">
      <div className="text-center container max-w-md">
        <h2 className="headline-md text-[#1a1a1a] mb-4">page not found</h2>
        <p className="text-[#502e23]/70 mb-8">
          Δεν βρήκαμε τη σελίδα που ψάχνεις.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white px-6 py-3 rounded-full text-sm tracking-wide transition-colors"
        >
          Επιστροφή στην αρχική
        </Link>
      </div>
    </main>
  )
}

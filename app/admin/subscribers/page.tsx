import { createClient } from "@supabase/supabase-js"

// Create Supabase client for server-side operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getSubscribers() {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })

  if (error) {
    console.error("Error fetching subscribers:", error)
    return []
  }

  return data || []
}

export default async function SubscribersPage() {
  const subscribers = await getSubscribers()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Newsletter Subscribers</h1>
        <p className="text-gray-600">
          Total subscribers: {subscribers.filter((s) => s.status === "active").length} active, {subscribers.length}{" "}
          total
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subscriber.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscriber.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {subscriber.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {subscribers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscribers yet.</p>
        </div>
      )}
    </div>
  )
}

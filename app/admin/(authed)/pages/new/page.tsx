import { AdminPageHeader } from "@/components/admin/page-header"
import { PageForm } from "@/components/admin/page-form"

export default function NewPageRoute() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="cms"
        title="Νέα σελίδα"
        back={{ href: "/admin/pages", label: "πίσω στις σελίδες" }}
      />
      <PageForm />
    </div>
  )
}

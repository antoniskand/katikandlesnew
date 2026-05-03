import { getSettings } from "@/lib/db-queries"
import { AdminPageHeader } from "@/components/admin/page-header"
import { SettingsForm } from "@/components/admin/settings-form"

export const dynamic = "force-dynamic"

export default async function SettingsAdmin() {
  const settings = await getSettings()
  return (
    <div>
      <AdminPageHeader eyebrow="config" title="Ρυθμίσεις" />
      <SettingsForm initial={settings} />
    </div>
  )
}

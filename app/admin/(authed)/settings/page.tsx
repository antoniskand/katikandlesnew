import { getSupabaseServiceClient } from "@/lib/supabase-server"
import { AdminPageHeader } from "@/components/admin/page-header"
import { SettingsForm } from "@/components/admin/settings-form"

export const dynamic = "force-dynamic"

export default async function SettingsAdmin() {
  const supabase = getSupabaseServiceClient()
  const { data } = await supabase.from("site_settings").select("*")

  const settings: Record<string, any> = {}
  for (const row of data || []) {
    settings[row.key] = row.value
  }

  return (
    <div>
      <AdminPageHeader eyebrow="config" title="Ρυθμίσεις" />
      <SettingsForm initial={settings} />
    </div>
  )
}

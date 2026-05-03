import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { SocialLinks } from "@/components/social-links"
import { MapPin, Mail, Clock } from "lucide-react"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Επικοινωνία",
  description:
    "Επικοινώνησε με την Kati Kandles. Είμαστε εδώ για κάθε ερώτηση ή custom παραγγελία.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <main className="bg-[#fafaf7] pt-28 md:pt-36 pb-20">
      <BreadcrumbJsonLd
        items={[
          { name: "Αρχική", url: "/" },
          { name: "Επικοινωνία", url: "/contact" },
        ]}
      />
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="mb-14 md:mb-20 max-w-2xl">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">
            επικοινωνία
          </p>
          <h1 className="headline-md text-[#1a1a1a] mb-6">
            μίλα μας
          </h1>
          <p className="text-[#1a1a1a]/70 leading-relaxed">
            Έχεις απορία, ιδέα για custom παραγγελία ή θες να συνεργαστούμε; Στείλε μήνυμα — απαντάμε σε 1–2 μέρες.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-14 lg:gap-20 items-start">
          {/* Form */}
          <div>
            <div className="flex items-baseline gap-6 md:gap-10 mb-8 pb-3 border-b border-[#1a1a1a]">
              <span className="text-sm tabular-nums tracking-[0.1em] text-[#1a1a1a]/40">01</span>
              <h2 className="text-xl md:text-2xl tracking-tight lowercase text-[#1a1a1a]">
                στείλε μήνυμα
              </h2>
            </div>
            <div className="md:pl-[3.25rem]">
              <ContactForm />
            </div>
          </div>

          {/* Info */}
          <aside className="space-y-12">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-6">
                πληροφορίες
              </p>
              <dl className="space-y-6 border-t border-[#1a1a1a]/12 pt-6">
                <InfoRow icon={MapPin} label="τοποθεσία">
                  Αθήνα, Ελλάδα
                </InfoRow>
                <InfoRow icon={Mail} label="email">
                  <a
                    href="mailto:hello@katikandles.gr"
                    className="text-[#1a1a1a] underline underline-offset-4 hover:opacity-70 transition-opacity"
                  >
                    hello@katikandles.gr
                  </a>
                </InfoRow>
                <InfoRow icon={Clock} label="ωράριο">
                  <span className="leading-relaxed">
                    Δευτέρα – Παρασκευή · 9:00 – 17:00
                    <br />
                    Σάββατο · 10:00 – 16:00
                    <br />
                    Κυριακή · κλειστά
                  </span>
                </InfoRow>
              </dl>
            </div>

            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-6">
                follow us
              </p>
              <p className="text-[#1a1a1a]/70 text-sm leading-relaxed mb-5">
                Ενημερώσου για τα νέα drops και τα behind-the-scenes.
              </p>
              <SocialLinks className="justify-start" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-5 items-start">
      <div className="pt-1">
        <Icon className="h-4 w-4 text-[#1a1a1a]/50" />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 mb-1.5">
          {label}
        </p>
        <div className="text-[#1a1a1a]/85">{children}</div>
      </div>
    </div>
  )
}

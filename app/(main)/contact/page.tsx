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
    <main className="bg-[#f7e7ce] pt-28 md:pt-32 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Αρχική", url: "/" },
          { name: "Επικοινωνία", url: "/contact" },
        ]}
      />
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="caption text-[#502e23]/60 mb-3">contact</div>
            <h1 className="headline-md text-[#1a1a1a] mb-4">επικοινωνία</h1>
            <p className="body-md text-[#502e23]/75 max-w-2xl mx-auto">
              Έχεις απορία, ιδέα για custom παραγγελία ή θες να συνεργαστούμε; Στείλε μήνυμα — απαντάμε σε 1-2 μέρες.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="bg-white/70 rounded-2xl border border-white/90 p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6 text-[#1a1a1a]">Στείλε μήνυμα</h2>
              <ContactForm />
            </div>

            <div className="space-y-6">
              <div className="bg-white/70 rounded-2xl border border-white/90 p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6 text-[#1a1a1a]">Πληροφορίες</h2>
                <div className="space-y-5">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-[#ff6b35] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#1a1a1a]">Τοποθεσία</h3>
                      <p className="text-[#502e23]/75 mt-1">Αθήνα, Ελλάδα</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-[#ff6b35] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#1a1a1a]">Email</h3>
                      <a
                        href="mailto:hello@katikandles.gr"
                        className="text-[#502e23]/75 mt-1 inline-block hover:text-[#ff6b35] transition-colors"
                      >
                        hello@katikandles.gr
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-[#ff6b35] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#1a1a1a]">Ωράριο</h3>
                      <p className="text-[#502e23]/75 mt-1 leading-relaxed">
                        Δευτέρα – Παρασκευή: 9:00 – 17:00
                        <br />
                        Σάββατο: 10:00 – 16:00
                        <br />
                        Κυριακή: κλειστά
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 rounded-2xl border border-white/90 p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4 text-[#1a1a1a]">Follow us</h2>
                <p className="text-[#502e23]/75 mb-4">
                  Ενημερώσου για τα νέα drops και τα behind-the-scenes.
                </p>
                <SocialLinks className="justify-start" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

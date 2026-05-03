import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Αποστολές και Επιστροφές | Kati Kandles",
  description: "Πολιτική ακύρωσης παραγγελίας και επιστροφής προϊόντος της Kati Kandles",
}

export default function ShippingReturnsPage() {
  return (
    <main className="bg-[#fafaf7] pt-28 md:pt-36 pb-20">
      <div className="mx-auto max-w-3xl px-6 md:px-12 lg:px-16">
        <p className="text-[11px] tracking-[0.22em] uppercase text-[#1a1a1a]/50 mb-4">policy</p>
        <h1 className="headline-md text-[#1a1a1a] mb-14">
          αποστολές
          <br />
          & επιστροφές
        </h1>

        <article className="space-y-14 text-[#1a1a1a]/80 leading-relaxed">
          <section>
            <div className="flex items-baseline gap-6 md:gap-10 mb-6 pb-3 border-b border-[#1a1a1a]">
              <span className="text-sm tabular-nums tracking-[0.1em] text-[#1a1a1a]/40">01</span>
              <h2 className="text-xl md:text-2xl tracking-tight lowercase text-[#1a1a1a]">
                ακύρωση παραγγελίας
              </h2>
            </div>
            <div className="md:pl-[3.25rem] space-y-4">
              <p>
                Η ακύρωση μιας παραγγελίας μπορεί να πραγματοποιηθεί εφόσον δεν έχει εισέλθει
                ήδη στη διαδικασία διεκπεραίωσης και όχι αργότερα από 24 ώρες μετά την καταχώρησή
                της στο{" "}
                <span className="text-[#1a1a1a]">www.katikandles.gr</span>. Η ακύρωση γίνεται
                κατόπιν επικοινωνίας μέσω email στη διεύθυνση{" "}
                <a
                  href="mailto:support@katikandles.gr"
                  className="text-[#1a1a1a] underline underline-offset-4"
                >
                  support@katikandles.gr
                </a>
                , με θέμα «Ακύρωση παραγγελίας» και αναφορά του αριθμού παραγγελίας.
              </p>
              <p>
                Η επιστροφή του ποσού που έχει καταβληθεί πραγματοποιείται εντός δέκα (10)
                εργάσιμων ημερών από την ημερομηνία ακύρωσης, με τον ίδιο τρόπο που έγινε η
                αρχική πληρωμή.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-baseline gap-6 md:gap-10 mb-6 pb-3 border-b border-[#1a1a1a]">
              <span className="text-sm tabular-nums tracking-[0.1em] text-[#1a1a1a]/40">02</span>
              <h2 className="text-xl md:text-2xl tracking-tight lowercase text-[#1a1a1a]">
                επιστροφή λόγω λάθους ή ελαττώματος
              </h2>
            </div>
            <div className="md:pl-[3.25rem] space-y-4">
              <p>
                Σε περίπτωση παράδοσης λανθασμένου προϊόντος (λάθος είδος ή ποσότητα) ή
                προϊόντος με πραγματικό ελάττωμα ή έλλειψη συνομολογημένης ιδιότητας που
                περιγράφεται στον ιστότοπο, ο πελάτης έχει δικαίωμα να επιστρέψει το προϊόν,
                με έξοδα της εταιρείας.
              </p>
              <p>
                Η ειδοποίηση πρέπει να γίνει εντός είκοσι (20) ημερολογιακών ημερών από την
                παραλαβή του προϊόντος με αποστολή email στο{" "}
                <a
                  href="mailto:support@katikandles.gr"
                  className="text-[#1a1a1a] underline underline-offset-4"
                >
                  support@katikandles.gr
                </a>
                .
              </p>
              <p>
                Μετά την παραλαβή και επιβεβαίωση του ελαττώματος ή του λάθους, η Kati Kandles
                αναλαμβάνει — κατά τη διακριτική της ευχέρεια — είτε να αντικαταστήσει το προϊόν,
                είτε να το επιδιορθώσει. Εάν αυτό δεν είναι δυνατό σε εύλογο χρονικό διάστημα,
                ο πελάτης δικαιούται πλήρους επιστροφής χρημάτων με τον ίδιο τρόπο πληρωμής.
              </p>
              <p>
                Το προς επιστροφή προϊόν πρέπει να συνοδεύεται από τα σχετικά παραστατικά
                αγοράς (απόδειξη ή τιμολόγιο) και να βρίσκεται στην αρχική του συσκευασία,
                στην κατάσταση που παραλήφθηκε, χωρίς να έχει χρησιμοποιηθεί ή αλλοιωθεί.
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  )
}

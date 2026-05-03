"use client"

import { motion } from "framer-motion"

const FEATURES = [
  {
    title: "handmade",
    description:
      "Φτιαγμένα με φροντίδα σε μικρές παρτίδες, για ποιότητα και μοναδικότητα σε κάθε κομμάτι.",
  },
  {
    title: "limited edition",
    description: "Κάθε συλλογή είναι limited edition. Όταν εξαντληθεί, εξαντλήθηκε.",
  },
  {
    title: "soya & vegan",
    description:
      "100% κερί σόγιας. Vegan, skin-safe, χωρίς παραφίνη ή τοξικά πρόσθετα.",
  },
  {
    title: "whateverness",
    description:
      "Αρώματα προσεκτικά επιλεγμένα να ενεργοποιούν αισθήσεις και να δημιουργούν την ιδανική ατμόσφαιρα.",
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-24 md:py-36 bg-[#1a1a1a] overflow-hidden">
      {/* Massive background word */}
      <div className="absolute inset-y-0 left-0 right-0 z-0 pointer-events-none overflow-hidden flex items-center">
        <motion.span
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 0.06, x: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="block whitespace-nowrap font-light tracking-tighter leading-none lowercase text-white -ml-[3vw]"
          style={{ fontSize: "clamp(8rem, 22vw, 22rem)" }}
        >
          γιατί
        </motion.span>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <motion.div
          className="mb-16 md:mb-24 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-[11px] tracking-[0.22em] uppercase text-white/50 mb-4">
            why kati kandles
          </p>
          <h2 className="headline-md text-white mb-6">
            γιατί να μας
            <br />
            επιλέξεις
          </h2>
          <p className="text-white/65 text-lg leading-relaxed">
            Τα κεριά μας είναι κάτι περισσότερο από προϊόντα — είναι εμπειρίες
            φτιαγμένες με φροντίδα και προσοχή στη λεπτομέρεια.
          </p>
        </motion.div>

        <div className="border-t border-white/15">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="grid md:grid-cols-[6rem_1fr_2fr] gap-6 md:gap-12 py-10 md:py-12 border-b border-white/15 items-baseline"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <span className="tabular-nums text-sm tracking-[0.1em] text-white/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-2xl md:text-3xl tracking-tight lowercase text-white">
                {feature.title}
              </h3>
              <p className="text-white/65 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

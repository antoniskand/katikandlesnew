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
    <section className="pt-12 pb-24 md:py-28 bg-[#f7e7ce]">
      <div className="mx-auto max-w-7xl px-8 md:px-16 lg:px-24">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="caption text-[#502e23]/60 mb-4">why kati kandles</div>
          <h2 className="headline-md text-[#1a1a1a] mb-6">
            γιατί να μας
            <br />
            επιλέξεις
          </h2>
          <p className="body-lg text-[#5a5a5a] max-w-2xl">
            Τα κεριά μας είναι κάτι περισσότερο από προϊόντα — είναι εμπειρίες
            φτιαγμένες με φροντίδα και προσοχή στη λεπτομέρεια.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="border-l-2 border-[#ff6b35] pl-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <h3 className="headline-sm text-[#1a1a1a] mb-4">{feature.title}</h3>
              <p className="body-md text-[#5a5a5a]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

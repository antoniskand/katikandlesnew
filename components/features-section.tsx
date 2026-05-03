"use client"

import { motion } from "framer-motion"
import { Flame, Clock, Leaf, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeaturesSection() {
  const badge = "WHY CHOOSE US"
  const title = "Crafted with Love"
  const subtitle =
    "Τα κεριά μας είναι κάτι περισσότερο από απλά προϊόντα - είναι εμπειρίες φτιαγμένες με φροντίδα και προσοχή στη λεπτομέρεια"

  const features = [
    {
      _key: "feature1",
      title: "Handmade",
      description:
        "Φτιαγμένα με φροντίδα σε μικρές παρτίδες για να εξασφαλίσουμε ποιότητα και μοναδικότητα σε κάθε κομμάτι.",
      icon: "flame",
    },
    {
      _key: "feature2",
      title: "Limited Edition",
      description: "Κάθε συλλογή είναι limited edition, κάνοντας κάθε αγορά ξεχωριστή και μοναδική.",
      icon: "clock",
    },
    {
      _key: "feature3",
      title: "Soya & Vegan",
      description:
        "Φτιαγμένα από 100% κερί σόγιας. Vegan, skin-safe, φιλικά για εσάς, τα ζώα και τον χώρο σας. Απαλλαγμένα από παραφίνη και άλλα τοξικά πρόσθετα.",
      icon: "leaf",
    },
    {
      _key: "feature4",
      title: "WhatEverness",
      description:
        "Προσεκτικά επιλεγμένα αρώματα σχεδιασμένα να ενεργοποιούν τις αισθήσεις σας και να δημιουργούν την ιδανική ατμόσφαιρα, μεταμορφώνοντας το χώρο σας",
      icon: "sparkles",
    },
  ]

  // Helper function to render the correct icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "flame":
        return <Flame className="h-7 w-7 text-coral" />
      case "clock":
        return <Clock className="h-7 w-7 text-emerald-600" />
      case "leaf":
        return <Leaf className="h-7 w-7 text-purple-600" />
      case "sparkles":
        return <Sparkles className="h-7 w-7 text-amber-600" />
      default:
        return <Flame className="h-7 w-7 text-coral" />
    }
  }

  // Helper function to get the correct background color
  const getIconBgColor = (index: number) => {
    switch (index % 4) {
      case 0:
        return "bg-coral/10"
      case 1:
        return "bg-mint/20"
      case 2:
        return "bg-lavender/20"
      case 3:
        return "bg-sunshine/20"
      default:
        return "bg-coral/10"
    }
  }

  return (
    <section className="pt-12 pb-24 md:py-24 bg-[#f7e7ce]">
      <div className="mx-auto max-w-7xl px-8 md:px-16 lg:px-24">
        <div className="mb-16">
          <h2 className="headline-md text-[#1a1a1a] mb-6">
            γιατί να μας
            <br />
            επιλέξεις
          </h2>
          <p className="body-lg text-[#5a5a5a] max-w-2xl">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature._key}
              className="border-l-2 border-[#ff6b35] pl-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="headline-sm text-[#1a1a1a] mb-4">{feature.title.toLowerCase()}</h3>
              <p className="body-md text-[#5a5a5a]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { Flame, Clock, Leaf, Sparkles } from "lucide-react"

export function StorySection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section ref={ref} className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-16 lg:grid-cols-2"
        >
          <motion.div variants={itemVariants} className="flex flex-col justify-center">
            <span className="mb-6 inline-block text-sm font-medium uppercase tracking-wider text-gray-500">
              Our Story
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Crafting Moods, <br />
              Not Just Candles
            </h2>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-gray-600">
              <p>
                At Kati Kandles, we believe in creating more than just candles. We craft experiences, moods, and moments
                that transform your space.
              </p>
              <p>
                Each of our limited-edition drops tells a unique story through scent and design. We carefully select
                soya-based, vegan, and plant-based ingredients to create aromatics that elevate your environment.
              </p>
              <p>
                Our candles are handmade in small batches, ensuring quality and uniqueness in every piece. We're
                passionate about creating products that are as beautiful as they are fragrant.
              </p>
              <p className="font-medium">
                That's why we say our candles "Smell Like WhatEverness" — because they're designed to match whatever
                mood you're in or want to be in.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/placeholder.svg?key=154uk"
                alt="Candle making process"
                width={500}
                height={600}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-12 overflow-hidden rounded-2xl">
              <Image
                src="/placeholder.svg?key=xox5p"
                alt="Natural ingredients"
                width={500}
                height={600}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={itemVariants} className="rounded-2xl bg-gray-50 p-8">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
              <Flame className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Handmade</h3>
            <p className="mt-4 text-gray-600">
              Crafted with care in small batches to ensure quality and uniqueness in every piece.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-2xl bg-gray-50 p-8">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Limited Edition</h3>
            <p className="mt-4 text-gray-600">
              Each drop is a limited edition collection, making every purchase special and unique.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-2xl bg-gray-50 p-8">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Soya & Vegan</h3>
            <p className="mt-4 text-gray-600">
              Made with 100% soya-based, vegan, and plant-based ingredients for a clean, sustainable burn.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-2xl bg-gray-50 p-8">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">WhatEverness</h3>
            <p className="mt-4 text-gray-600">
              Carefully crafted scents designed to evoke specific moods and transform your space.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

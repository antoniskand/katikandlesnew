"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AnimatedTextProps {
  texts?: string[]
  interval?: number
  className?: string
}

export function AnimatedText({ texts = [], interval = 3000, className = "" }: AnimatedTextProps) {
  const [index, setIndex] = useState(0)
  const [currentText, setCurrentText] = useState(texts[0] || "Handmade candles")

  useEffect(() => {
    if (!texts || texts.length === 0) {
      setCurrentText("Handmade candles with vibrant aesthetics")
      return
    }

    setCurrentText(texts[index] || "Handmade candles")

    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, interval)

    return () => clearInterval(timer)
  }, [texts, index, interval])

  return (
    <div className={`relative h-[1.5em] overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {currentText}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

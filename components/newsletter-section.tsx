"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { subscribeToNewsletter } from "@/app/actions/newsletter"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error"
    message: string
  }>({
    type: "idle",
    message: "",
  })

  const badge = "STAY UPDATED"
  const title = "Get Drop Notifications"
  const description =
    "Μάθετε πρώτοι για τα επόμενα limited drops για να προλάβετε το άρωμα που θα γίνει το επόμενο αγαπημένο σας"
  const buttonText = "Subscribe"
  const placeholderText = "Εισάγετε το email σας"

  const handleSubmit = async (formData: FormData) => {
    try {
      setStatus({ type: "loading", message: "" })

      const result = await subscribeToNewsletter(formData)

      if (result.success) {
        setStatus({ type: "success", message: result.message })
        setEmail("") // Clear the input on success
      } else {
        setStatus({ type: "error", message: result.message })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      })
    }
  }

  return (
    null
  )
}

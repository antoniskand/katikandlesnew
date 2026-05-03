"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "Όνομα τουλάχιστον 2 χαρακτήρες"),
  email: z.string().email("Έγκυρο email παρακαλώ"),
  subject: z.string().min(3, "Θέμα τουλάχιστον 3 χαρακτήρες"),
  message: z.string().min(10, "Μήνυμα τουλάχιστον 10 χαρακτήρες"),
})

type FormValues = z.infer<typeof formSchema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => fd.set(k, v))
      const { submitContactForm } = await import("@/app/actions/contact")
      const result = await submitContactForm(fd)
      if (!result.success) throw new Error(result.message)
      toast({ title: "Στάλθηκε", description: "Θα σου απαντήσουμε σύντομα." })
      reset()
    } catch {
      toast({
        title: "Κάτι πήγε στραβά",
        description: "Δοκίμασε ξανά ή στείλε email.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-[#1a1a1a]">
          Όνομα
        </label>
        <Input
          id="name"
          placeholder="Το όνομά σου"
          {...register("name")}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a]">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="hello@example.com"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-medium text-[#1a1a1a]">
          Θέμα
        </label>
        <Input
          id="subject"
          placeholder="Σχετικά με..."
          {...register("subject")}
          className={errors.subject ? "border-red-500" : ""}
        />
        {errors.subject && <p className="text-red-600 text-sm">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-medium text-[#1a1a1a]">
          Μήνυμα
        </label>
        <Textarea
          id="message"
          placeholder="Πες μας τι σκέφτεσαι..."
          rows={5}
          {...register("message")}
          className={errors.message ? "border-red-500" : ""}
        />
        {errors.message && <p className="text-red-600 text-sm">{errors.message.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 text-white tracking-wide"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Αποστολή...
          </>
        ) : (
          "Αποστολή μηνύματος"
        )}
      </Button>
    </form>
  )
}

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <Field
        id="name"
        label="όνομα"
        placeholder="Το όνομά σου"
        error={errors.name?.message}
        registerProps={register("name")}
      />
      <Field
        id="email"
        label="email"
        type="email"
        placeholder="hello@example.com"
        error={errors.email?.message}
        registerProps={register("email")}
      />
      <Field
        id="subject"
        label="θέμα"
        placeholder="Σχετικά με…"
        error={errors.subject?.message}
        registerProps={register("subject")}
      />
      <label className="block">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 block mb-2">
          μήνυμα
        </span>
        <textarea
          rows={5}
          placeholder="Πες μας τι σκέφτεσαι…"
          {...register("message")}
          className={`w-full px-0 py-2 bg-transparent border-0 border-b focus:outline-none text-[#1a1a1a] placeholder-[#1a1a1a]/30 resize-none transition-colors ${
            errors.message ? "border-destructive" : "border-[#1a1a1a]/20 focus:border-[#1a1a1a]"
          }`}
        />
        {errors.message && (
          <p className="text-destructive text-xs mt-1.5">{errors.message.message}</p>
        )}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 inline-flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#1a1a1a]/85 disabled:opacity-60 text-white text-sm tracking-[0.06em] uppercase transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            αποστολή…
          </>
        ) : (
          "στείλε το"
        )}
      </button>
    </form>
  )
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  error,
  registerProps,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  error?: string
  registerProps: ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 block mb-2">
        {label}
      </span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registerProps}
        className={`w-full px-0 py-2 bg-transparent border-0 border-b focus:outline-none text-[#1a1a1a] placeholder-[#1a1a1a]/30 transition-colors ${
          error ? "border-destructive" : "border-[#1a1a1a]/20 focus:border-[#1a1a1a]"
        }`}
      />
      {error && <p className="text-destructive text-xs mt-1.5">{error}</p>}
    </label>
  )
}

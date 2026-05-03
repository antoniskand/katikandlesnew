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
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
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
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)

    try {
      // In a real implementation, you would send this data to your server
      // For now, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      })

      reset()
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Your message couldn't be sent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          placeholder="Your name"
          {...register("name")}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-medium">
          Subject
        </label>
        <Input
          id="subject"
          placeholder="What is this regarding?"
          {...register("subject")}
          className={errors.subject ? "border-red-500" : ""}
        />
        {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <Textarea
          id="message"
          placeholder="Your message..."
          rows={5}
          {...register("message")}
          className={errors.message ? "border-red-500" : ""}
        />
        {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
      </div>

      <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  )
}

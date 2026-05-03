import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { SocialLinks } from "@/components/social-links"
import { MapPin, Mail, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | Kati Kandles",
  description: "Get in touch with Kati Kandles. We'd love to hear from you!",
}

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our products or want to place a custom order? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-coral-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Our Location</h3>
                    <p className="text-gray-600 mt-1">Athens, Greece</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-coral-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <a
                      href="mailto:hello@katikandles.com"
                      className="text-gray-600 mt-1 hover:text-coral-500 transition-colors"
                    >
                      hello@katikandles.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-coral-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Business Hours</h3>
                    <p className="text-gray-600 mt-1">
                      Monday - Friday: 9am - 5pm
                      <br />
                      Saturday: 10am - 4pm
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-6">Follow Us</h2>
              <p className="text-gray-600 mb-4">
                Stay updated with our latest products, promotions, and behind-the-scenes content.
              </p>
              <SocialLinks className="justify-start" />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-6">FAQ</h2>
              <p className="text-gray-600 mb-4">
                Have a question? Check our{" "}
                <a href="/faq" className="text-coral-500 hover:underline">
                  Frequently Asked Questions
                </a>{" "}
                page for quick answers to common inquiries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

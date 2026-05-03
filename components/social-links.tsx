import { Instagram, Facebook, Twitter } from "lucide-react"

interface SocialLinksProps {
  className?: string
}

export function SocialLinks({ className = "justify-center" }: SocialLinksProps) {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <a
        href="https://instagram.com/katikandles"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-coral-500 transition-colors"
        aria-label="Follow us on Instagram"
      >
        <Instagram className="h-6 w-6" />
      </a>
      <a
        href="https://facebook.com/katikandles"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-coral-500 transition-colors"
        aria-label="Follow us on Facebook"
      >
        <Facebook className="h-6 w-6" />
      </a>
      <a
        href="https://twitter.com/katikandles"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-coral-500 transition-colors"
        aria-label="Follow us on Twitter"
      >
        <Twitter className="h-6 w-6" />
      </a>
    </div>
  )
}

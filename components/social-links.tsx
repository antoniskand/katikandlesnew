import { Instagram } from "lucide-react"

interface SocialLinksProps {
  className?: string
}

export function SocialLinks({ className = "" }: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href="https://www.instagram.com/kati.kandles/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/60 hover:bg-[#ff6b35] hover:text-white text-[#502e23] transition-colors"
        aria-label="Instagram"
      >
        <Instagram className="h-4 w-4" />
      </a>
      <a
        href="https://www.tiktok.com/@kati.kandles"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/60 hover:bg-[#ff6b35] hover:text-white text-[#502e23] transition-colors"
        aria-label="TikTok"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
        </svg>
      </a>
    </div>
  )
}

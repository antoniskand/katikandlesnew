import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface Props {
  title: string
  eyebrow?: string
  back?: { href: string; label: string }
  actions?: React.ReactNode
}

export function AdminPageHeader({ title, eyebrow, back, actions }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        {back && (
          <Link
            href={back.href}
            className="inline-flex items-center gap-1 text-sm text-[#502e23]/70 hover:text-[#1a1a1a] mb-3"
          >
            <ChevronLeft className="h-4 w-4" /> {back.label}
          </Link>
        )}
        {eyebrow && <div className="caption text-[#ff6b35] mb-2">{eyebrow}</div>}
        <h1 className="headline-md text-[#1a1a1a] text-3xl md:text-4xl">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

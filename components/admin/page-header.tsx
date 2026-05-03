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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
      <div>
        {back && (
          <Link
            href={back.href}
            className="inline-flex items-center gap-1 text-sm text-[#1a1a1a]/55 hover:text-[#1a1a1a] mb-4"
          >
            <ChevronLeft className="h-4 w-4" /> {back.label}
          </Link>
        )}
        {eyebrow && (
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#1a1a1a]/50 mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="headline-md text-[#1a1a1a]">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

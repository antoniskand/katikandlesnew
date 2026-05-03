"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  Package,
  Sparkles,
  FileText,
  Receipt,
  Users,
  Tag,
  LayoutGrid,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"
import { signOutAction } from "@/app/admin/login/actions"

interface AdminUser {
  id: string
  email: string
  role: "owner" | "admin" | "editor"
  display_name?: string
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Προϊόντα", icon: Package },
  { href: "/admin/drops", label: "Drops", icon: Sparkles },
  { href: "/admin/orders", label: "Παραγγελίες", icon: Receipt },
  { href: "/admin/pages", label: "Σελίδες", icon: FileText },
  { href: "/admin/categories", label: "Κατηγορίες", icon: LayoutGrid },
  { href: "/admin/coupons", label: "Κουπόνια", icon: Tag },
  { href: "/admin/subscribers", label: "Newsletter", icon: Users },
  { href: "/admin/settings", label: "Ρυθμίσεις", icon: Settings },
]

export function AdminShell({
  admin,
  children,
}: {
  admin: AdminUser | null
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOutAction()
    router.replace("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col bg-white border-r border-[#1a1a1a]/8 sticky top-0 h-screen">
        <SidebarContent
          admin={admin}
          pathname={pathname}
          onSignOut={handleSignOut}
          onLinkClick={() => {}}
        />
      </aside>

      {/* Sidebar — mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#1a1a1a]/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="relative z-10 flex w-72 flex-col bg-white border-r border-[#1a1a1a]/8">
            <SidebarContent
              admin={admin}
              pathname={pathname}
              onSignOut={handleSignOut}
              onLinkClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-[#1a1a1a]/8 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 hover:bg-[#1a1a1a]/5"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="text-[#1a1a1a]">
            <Logo size="sm" />
          </Link>
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="p-2 hover:bg-[#1a1a1a]/5"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 p-6 md:p-10 lg:p-12">{children}</main>
      </div>
    </div>
  )
}

function SidebarContent({
  admin,
  pathname,
  onSignOut,
  onLinkClick,
}: {
  admin: AdminUser | null
  pathname: string
  onSignOut: () => void
  onLinkClick: () => void
}) {
  return (
    <>
      <div className="px-6 py-6 border-b border-[#1a1a1a]/8 flex items-center justify-between">
        <Link href="/admin" className="text-[#1a1a1a]" onClick={onLinkClick}>
          <Logo size="sm" />
        </Link>
        <button
          onClick={onLinkClick}
          className="lg:hidden p-2 hover:bg-[#1a1a1a]/5"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <p className="px-6 mb-3 text-[10px] tracking-[0.18em] uppercase text-[#1a1a1a]/40">
          menu
        </p>
        <div className="flex flex-col">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onLinkClick}
                className={cn(
                  "group flex items-center gap-3 px-6 py-2.5 text-sm transition-colors border-l-2",
                  active
                    ? "border-[#1a1a1a] text-[#1a1a1a] bg-[#1a1a1a]/[0.03] font-medium"
                    : "border-transparent text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/[0.02]",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-60")} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-[#1a1a1a]/8 p-6">
        {admin && (
          <div className="mb-4">
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#1a1a1a]/40 mb-1">
              {admin.role}
            </p>
            <p className="text-sm text-[#1a1a1a] truncate">
              {admin.display_name || admin.email}
            </p>
          </div>
        )}
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-sm text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          αποσύνδεση
        </button>
      </div>
    </>
  )
}

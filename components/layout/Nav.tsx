"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/request/feature", label: "Request a Feature" },
  { href: "/request/incident", label: "Report an Incident" },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 flex h-14 items-center gap-6">
        <span className="font-semibold text-sm tracking-tight">
          DevOps Front Door
        </span>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === link.href
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

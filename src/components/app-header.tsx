'use client'

import Link from 'next/link'
import { CalendarDays, CookingPot, ListChecks, Sprout } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Plan', icon: CalendarDays },
  { href: '/recipes', label: 'Recipes', icon: CookingPot },
  { href: '/grocery', label: 'Groceries', icon: ListChecks },
]

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--paper)/0.94] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Mise home"
        >
          <span className="grid size-9 place-items-center rounded-md bg-[var(--leaf)] text-white">
            <Sprout className="size-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-2xl font-semibold text-[var(--ink)]">
            Mise
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href.split('/').slice(0, 2).join('/'))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:bg-white hover:text-[var(--ink)] sm:px-4',
                  active &&
                    'bg-white text-[var(--ink)] shadow-[0_1px_0_rgba(24,39,32,0.08)]',
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

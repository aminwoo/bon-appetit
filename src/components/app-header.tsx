'use client'

import Link from 'next/link'
import { CalendarDays, CookingPot, ListChecks, Sprout } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'

const links = [
  { href: '/', key: 'plan' as const, icon: CalendarDays },
  { href: '/recipes', key: 'recipes' as const, icon: CookingPot },
  { href: '/grocery', key: 'groceries' as const, icon: ListChecks },
]

export function AppHeader() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--paper)/0.90] shadow-[0_1px_12px_rgba(25,39,31,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          aria-label="Mise home"
        >
          <span className="grid size-9 place-items-center rounded-md bg-[var(--leaf)] text-white">
            <Sprout className="size-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-2xl font-semibold text-[var(--ink)]">
            Mise
          </span>
        </Link>

        <nav
          className="flex items-center gap-1"
          aria-label={t('mainNavigation')}
        >
          {links.map(({ href, key, icon: Icon }) => {
            const active =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href.split('/').slice(0, 2).join('/'))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[var(--muted)] transition-colors outline-none hover:bg-white/70 hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:px-4',
                  active &&
                    'bg-white text-[var(--ink)] shadow-[0_1px_4px_rgba(24,39,32,0.08)] after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:rounded-full after:bg-[var(--accent)]',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{t(key)}</span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="ml-1 flex h-10 items-center gap-1 rounded-md border border-[var(--line)] bg-white px-3 text-xs font-bold text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            aria-label={`${t('languageLabel')}: ${language === 'en' ? t('chinese') : t('english')}`}
            title={t('languageLabel')}
          >
            <span>{language === 'en' ? t('chinese') : t('english')}</span>
          </button>
        </nav>
      </div>
    </header>
  )
}

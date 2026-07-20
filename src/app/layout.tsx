import type { Metadata } from 'next'
import { Manrope, Newsreader } from 'next/font/google'
import { AppHeader } from '@/components/app-header'
import './globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
})

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Mise — Weekly meal planning',
  description:
    'Plan nourishing meals, scale recipes, and shop with one tidy list.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--paper)] text-[var(--ink)]">
        <AppHeader />
        {children}
      </body>
    </html>
  )
}

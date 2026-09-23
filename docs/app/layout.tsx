import type { Metadata } from 'next'
import Link from 'next/link'
import '@fairgarden/design/utils/global.css'
import '@fairgarden/design/utils/fonts'
import { ClientProvider } from '@fairgarden/design/utils/ClientProvider'
import { Ground } from '@fairgarden/design/foundations/ground'
import { Lockup } from '@/components/Logo'
import { Navigation } from '@/components/Navigation'
import { Search } from '@/components/Search'
import styles from '@/components/chrome.module.css'
import { sitemap } from './sitemap'

export const metadata: Metadata = {
  title: '@fairgarden/design',
  description: 'The FairGarden design system: React components built on Base UI.',
}

/**
 * The page is a paper band, the page root; the chrome takes its colors from
 * the scope's role variables, so it follows the page mode like any component.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ClientProvider locale="en-US">
          <Ground preset="paper" kind="band" render={<div className={styles.page} />}>
            <header className={styles.header}>
              <Link href="/" className={styles.brand}>
                <Lockup />
              </Link>
              <Search />
            </header>
            <div className={styles.frame}>
              <Navigation sitemap={sitemap} />
              <main className={styles.main}>{children}</main>
            </div>
          </Ground>
        </ClientProvider>
      </body>
    </html>
  )
}

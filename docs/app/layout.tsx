import type { Metadata } from 'next'
import Link from 'next/link'
import { CodeProviderLazy } from '@fairgarden/docs/CodeProvider'
import '@fairgarden/design/utils/global.css'
import '@fairgarden/design/utils/fonts'
import { ClientProvider } from '@fairgarden/design/utils/ClientProvider'
import { Ground } from '@fairgarden/design/foundations/ground'
import { ToastProvider } from '@fairgarden/design/feedback/toast'
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
 *
 * `CodeProviderLazy` gives every code block and demo the docs engine's client
 * side: the parser that highlights code the client produces (a TS → JS swap,
 * an edit), the transform-delta computer and the loaders, each fetched on
 * demand. Its default source enhancer is the same emphasis pass the build
 * runs, so client-parsed code keeps its highlights and windows.
 *
 * `ToastProvider` renders the docked toast bar every page shares: a code
 * block's or demo's copy actions confirm there ("Link copied"), and the
 * Toast page's demos add their toasts to it. It is the site's only
 * provider; a demo that wrapped its own would dock a second bar.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ClientProvider locale="en-US">
          <ToastProvider>
            <CodeProviderLazy>
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
            </CodeProviderLazy>
          </ToastProvider>
        </ClientProvider>
      </body>
    </html>
  )
}

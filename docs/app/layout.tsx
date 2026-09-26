import type { Metadata } from 'next'
import '@fairgarden/design/utils/global.css'
import '@fairgarden/design/utils/fonts'
import { ClientProvider } from '@fairgarden/design/utils/ClientProvider'

export const metadata: Metadata = {
  title: '@fairgarden/design',
  description: 'The FairGarden design system: React components built on Base UI.',
}

/**
 * What every page needs, the docs and the demo previews alike: the global
 * stylesheet (tokens, the Radix scales, the follow-OS mode and the roles),
 * the fonts, and `ClientProvider`, which gives the components the locale
 * and its direction.
 *
 * The rest sits below this layout. The docs pages are the `(docs)` group,
 * whose layout adds the chrome and the providers only the docs use (the
 * code engine, the toast bar). The full-page demo previews are `preview/`,
 * a chromeless layout of their own, outside the docs.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ClientProvider locale="en-US">{children}</ClientProvider>
      </body>
    </html>
  )
}

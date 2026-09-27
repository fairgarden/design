'use client'

import { useRouter } from 'next/navigation'
import { SearchDialog } from '@fairgarden/design/overlays/search-dialog'

/**
 * The header search: the design system's Search Dialog, which indexes the
 * precomputed sitemap with `useSearch` on mount, with ⌘K / Ctrl K. A chosen
 * result navigates with the Next.js router.
 */
export function Search() {
  const router = useRouter()
  return (
    <SearchDialog
      sitemap={() => import('../app/sitemap')}
      onNavigate={(href) => router.push(href)}
      keyboardShortcut
    />
  )
}

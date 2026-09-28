'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { SearchDialog } from '@fairgarden/design/overlays/search-dialog'

/**
 * The search dialog over this site's own sitemap: `useSearch` builds the
 * index on mount, and a chosen result navigates with the Next.js router.
 * No `keyboardShortcut`: the page's header search owns ⌘K / Ctrl K.
 */
export function SearchDialogBasic() {
  const router = useRouter()
  return (
    <SearchDialog
      label="Search the docs"
      sitemap={() => import('@/app/sitemap')}
      onNavigate={(href) => router.push(href)}
    />
  )
}

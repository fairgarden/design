'use client'

import * as React from 'react'
import {
  TableOfContents,
  useActiveHeading,
  type TableOfContentsItem,
} from '@fairgarden/design/navigation/table-of-contents'

/*
 * The docs layout's table-of-contents slot: a placeholder until the page
 * headings come from the docs engine (§11.15, "Wiring plan"). Only the
 * Docs Layout page feeds it, with its own headings written out by hand, so
 * the column (from 1440 px) and the compact bar (below) can be seen on a
 * real page. Every other page passes nothing, and the layout
 * shows neither.
 */
const staticContents: Record<string, readonly TableOfContentsItem[]> = {
  '/page/docs-layout': [
    { id: 'the-frame', title: 'The frame', level: 2 },
    { id: 'thresholds', title: 'Thresholds', level: 2 },
    { id: 'zero-layout-shift', title: 'Zero layout shift', level: 3 },
    { id: 'the-drawer', title: 'The drawer', level: 2 },
    { id: 'the-table-of-contents', title: 'The table of contents', level: 2 },
    { id: 'wiring-plan-planned', title: 'Wiring plan (planned)', level: 2 },
    { id: 'api-reference', title: 'API Reference', level: 2 },
    { id: 'docslayout', title: 'DocsLayout', level: 3 },
    { id: 'docslayoutdrawer', title: 'DocsLayoutDrawer', level: 3 },
    { id: 'additional-types', title: 'Additional types', level: 3 },
  ],
}

/** The page's contents with scrollspy (the section in view marked). */
function DocsToc({ items }: { items: readonly TableOfContentsItem[] }) {
  const ids = React.useMemo(() => items.map((item) => item.id), [items])
  const activeId = useActiveHeading(ids)
  return <TableOfContents items={items} activeId={activeId} />
}

/** The table of contents for a route, or `undefined`, so the layout shows none. */
export function tableOfContentsFor(pathname: string): React.ReactNode {
  const items = staticContents[pathname]
  return items == null ? undefined : <DocsToc items={items} />
}

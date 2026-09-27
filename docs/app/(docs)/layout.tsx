import { CodeProviderLazy } from '@fairgarden/docs/CodeProvider'
import { ToastProvider } from '@fairgarden/design/feedback/toast'
import { toSidebarItems } from '@fairgarden/design/utils/docs/toSidebarItems'
import { DocsFrame } from '@/components/DocsFrame'
import { sitemap } from '../sitemap'

/** The sidebar's page tree: the sitemap's sections and pages, built once on the server. */
const sidebarItems = toSidebarItems(sitemap)

/**
 * The docs chrome, around every docs page (the home page, the section
 * indexes, the component pages and their demo pages): the design system's
 * Docs Layout (DocsFrame), a paper page ground whose parts take their
 * colors from the scope's role variables, so it follows the page mode like
 * any component. The sidebar from 1024 px (the drawer below) and the
 * table of contents from 1440 px are placed by viewport media alone, so
 * the server HTML paints the final frame.
 *
 * `CodeProviderLazy` gives every code block and demo the docs engine's client
 * side: the parser that highlights code the client produces (a TS → JS swap,
 * an edit), the transform-delta computer and the loaders, each fetched on
 * demand. Its default source enhancer is the same emphasis pass the build
 * runs, so client-parsed code keeps its highlights and windows. Code the
 * build or the server already framed (fences and demos, and inline code
 * through `serverSourceEnhancers`) records that pass, which then skips it:
 * every window is in the server HTML, so nothing resizes after hydration.
 *
 * `ToastProvider` renders the docked toast bar every docs page shares: a
 * code block's or demo's copy actions confirm there ("Link copied"), and the
 * Toast page's demos add their toasts to it. It is the site's only toast
 * provider; a demo that wrapped its own would dock a second bar.
 *
 * The full-page demo previews (`app/preview`) sit outside this layout: no
 * chrome, and neither provider, since they render components without code.
 */
export default function DocsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <CodeProviderLazy>
        <DocsFrame items={sidebarItems}>{children}</DocsFrame>
      </CodeProviderLazy>
    </ToastProvider>
  )
}

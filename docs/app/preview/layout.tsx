import type { Metadata } from 'next'
import { PreviewStage } from '@/components/PreviewStage'

export const metadata: Metadata = {
  title: {
    default: 'Preview · @fairgarden/design',
    template: '%s · Preview · @fairgarden/design',
  },
  description: 'A full-page demo preview of @fairgarden/design.',
  robots: { index: false, follow: false },
}

/**
 * The full-page demo previews: one route per page-frame demo, mirroring
 * its docs path (`/preview/page/section-bar/demos/tabs` for the demo at
 * `/page/section-bar/demos/tabs`). Each renders the demo's component
 * alone, outside the docs layout: no chrome, no code, not indexed, and
 * listed in neither the navigation, the section indexes, search nor the
 * sitemap. A docs page shows one in its demo's page frame (FramedPreview),
 * whose "Full page" link opens it at the browser's width.
 */
export default function PreviewLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PreviewStage>{children}</PreviewStage>
}

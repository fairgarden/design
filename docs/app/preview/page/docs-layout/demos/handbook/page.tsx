import type { Metadata } from 'next'
import { DocsLayoutHandbook } from '@/app/(lib)/page/docs-layout/demos/handbook/DocsLayoutHandbook'

export const metadata: Metadata = { title: 'Docs Layout: A handbook page' }

export default function Page() {
  return <DocsLayoutHandbook />
}

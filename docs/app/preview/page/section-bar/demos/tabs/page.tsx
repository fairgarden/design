import type { Metadata } from 'next'
import { SectionBarTabs } from '@/app/(lib)/page/section-bar/demos/tabs/SectionBarTabs'

export const metadata: Metadata = { title: 'Section Bar: Tab strip' }

export default function Page() {
  return <SectionBarTabs />
}

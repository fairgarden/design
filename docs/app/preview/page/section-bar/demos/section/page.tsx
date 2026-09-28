import type { Metadata } from 'next'
import { SectionBarSection } from '@/app/(lib)/page/section-bar/demos/section/SectionBarSection'

export const metadata: Metadata = { title: 'Section Bar: Section bar' }

export default function Page() {
  return <SectionBarSection />
}

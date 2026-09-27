import type { Metadata } from 'next'
import { SectionBarGuide } from '@/app/(docs)/page/section-bar/demos/guide/SectionBarGuide'

export const metadata: Metadata = { title: 'Section Bar: Guide bar' }

export default function Page() {
  return <SectionBarGuide />
}

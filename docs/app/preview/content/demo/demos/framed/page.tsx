import type { Metadata } from 'next'
import { CrewBanner } from '@/app/(lib)/content/demo/demos/framed/CrewBanner'

export const metadata: Metadata = { title: 'Demo: Custom preview' }

export default function Page() {
  return <CrewBanner />
}

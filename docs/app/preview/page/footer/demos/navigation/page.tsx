import type { Metadata } from 'next'
import { FooterNavigation } from '@/app/(docs)/page/footer/demos/navigation/FooterNavigation'

export const metadata: Metadata = { title: 'Footer: One navigation object for header, drawer and footer' }

export default function Page() {
  return <FooterNavigation />
}

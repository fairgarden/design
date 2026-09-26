import type { Metadata } from 'next'
import { NavigationBarHeader } from '@/app/(docs)/navigation/navigation-bar/demos/header/NavigationBarHeader'

export const metadata: Metadata = { title: 'Navigation Bar: The site header' }

export default function Page() {
  return <NavigationBarHeader />
}

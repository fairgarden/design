'use client'

import * as React from 'react'
import { Button } from '@fairgarden-private/design/components/Button'
import { NavigationBar } from '@fairgarden-private/design/components/NavigationBar'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@fairgarden-private/design/components/NavigationMenu'
import { Wordmark } from '../header/Wordmark'
import styles from './variants.module.css'

const sections = [
  { href: '/why-land-matters', label: 'Why Land Matters' },
  { href: '/what-we-do', label: 'What We Do' },
  { href: '/take-action', label: 'Take Action' },
]

function Items() {
  return (
    <NavigationMenu>
      {sections.map((section) => (
        <NavigationMenuItem key={section.href}>
          <NavigationMenuLink href={section.href}>{section.label}</NavigationMenuLink>
        </NavigationMenuItem>
      ))}
    </NavigationMenu>
  )
}

const action = (
  <Button variant="solid" size="sm">
    Donate
  </Button>
)

/** The ruled cells, the stacked masthead and the compact (docked) header, on the tide page ground. */
export function NavigationBarVariants() {
  return (
    <div className={styles.stack}>
      <NavigationBar ruled preset="tide" logo={<Wordmark />} logoLabel="FairGarden home" currentPath="/take-action" action={action}>
        <Items />
      </NavigationBar>
      <NavigationBar masthead logo={<Wordmark />} logoLabel="FairGarden home" currentPath="/what-we-do/our-programs" action={action}>
        <Items />
      </NavigationBar>
      <NavigationBar compact logo={<Wordmark />} logoLabel="FairGarden home" action={action}>
        <Items />
      </NavigationBar>
    </div>
  )
}

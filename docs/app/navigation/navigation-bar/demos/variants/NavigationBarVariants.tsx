'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import { NavigationBar } from '@fairgarden/design/navigation/navigation-bar'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@fairgarden/design/navigation/navigation-menu'
import { Lockup } from '@/components/Logo'
import styles from './variants.module.css'

const sections = [
  { href: '/our-work', label: 'Our Work' },
  { href: '/programs', label: 'Programs' },
  { href: '/get-involved', label: 'Get Involved' },
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
      <NavigationBar ruled preset="tide" logo={<Lockup />} logoLabel="FairGarden home" currentPath="/get-involved" action={action}>
        <Items />
      </NavigationBar>
      <NavigationBar masthead logo={<Lockup />} logoLabel="FairGarden home" currentPath="/programs/gardens" action={action}>
        <Items />
      </NavigationBar>
      <NavigationBar compact logo={<Lockup />} logoLabel="FairGarden home" action={action}>
        <Items />
      </NavigationBar>
    </div>
  )
}

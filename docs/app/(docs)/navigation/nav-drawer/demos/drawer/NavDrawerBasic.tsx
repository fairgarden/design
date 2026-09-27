'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import {
  NavDrawer,
  NavDrawerFooter,
  NavDrawerGroup,
  NavDrawerLink,
} from '@fairgarden/design/navigation/nav-drawer'
import { Select } from '@fairgarden/design/forms/select'
import { Lockup } from '@/components/Logo'
import styles from './drawer.module.css'

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
]

/**
 * The drawer on its own (in a header it sits in the Navigation Bar's
 * `drawer` slot). The page is in Programs › Garden programs, so that group
 * opens with its row and link marked current.
 */
export function NavDrawerBasic() {
  return (
    <div className={styles.row}>
      <NavDrawer
        logo={<Lockup />}
        logoLabel="FairGarden home"
        currentPath="/programs/gardens"
        footer={
          <NavDrawerFooter
            action={
              <Button variant="solid" size="lg" nativeButton={false} render={<a href="/donate" />}>
                Donate
              </Button>
            }
            locale={<Select items={languages} defaultValue="en" aria-label="Language" />}
          >
            <NavDrawerLink href="/about">About</NavDrawerLink>
            <NavDrawerLink href="/contact">Contact</NavDrawerLink>
            <NavDrawerLink href="/accessibility">Accessibility settings</NavDrawerLink>
          </NavDrawerFooter>
        }
      >
        <NavDrawerGroup label="Our Work">
          <NavDrawerLink href="/our-work">Our work</NavDrawerLink>
          <NavDrawerLink href="/our-work/stewardship">Stewardship</NavDrawerLink>
          <NavDrawerLink href="/our-work/priorities">Priorities</NavDrawerLink>
        </NavDrawerGroup>
        <NavDrawerGroup label="Programs">
          <NavDrawerLink href="/programs">Programs</NavDrawerLink>
          <NavDrawerLink href="/programs/gardens">Garden programs</NavDrawerLink>
          <NavDrawerLink href="/programs/impact">Our impact</NavDrawerLink>
        </NavDrawerGroup>
        <NavDrawerGroup label="Get Involved">
          <NavDrawerLink href="/get-involved/volunteer">Volunteer</NavDrawerLink>
          <NavDrawerLink href="/get-involved/share-land">Share your land</NavDrawerLink>
          <NavDrawerLink href="/get-involved/give">Give</NavDrawerLink>
        </NavDrawerGroup>
        <NavDrawerLink href="/find-a-garden">Find a Garden</NavDrawerLink>
        <NavDrawerLink href="/news">News</NavDrawerLink>
      </NavDrawer>
    </div>
  )
}

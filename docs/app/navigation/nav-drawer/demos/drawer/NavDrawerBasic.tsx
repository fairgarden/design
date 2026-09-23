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
 * `drawer` slot). The page is in What We Do › Our Programs, so that group
 * opens with its row and link marked current.
 */
export function NavDrawerBasic() {
  return (
    <div className={styles.row}>
      <NavDrawer
        logo={<Lockup />}
        logoLabel="FairGarden home"
        currentPath="/what-we-do/our-programs"
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
        <NavDrawerGroup label="Why Land Matters">
          <NavDrawerLink href="/why-land-matters">Why land matters</NavDrawerLink>
          <NavDrawerLink href="/why-land-matters/land-conservation">Land conservation</NavDrawerLink>
          <NavDrawerLink href="/why-land-matters/priorities">Conservation priorities</NavDrawerLink>
        </NavDrawerGroup>
        <NavDrawerGroup label="What We Do">
          <NavDrawerLink href="/what-we-do">What we do</NavDrawerLink>
          <NavDrawerLink href="/what-we-do/our-programs">Our programs</NavDrawerLink>
          <NavDrawerLink href="/what-we-do/impact">Our collective impact</NavDrawerLink>
        </NavDrawerGroup>
        <NavDrawerGroup label="Take Action">
          <NavDrawerLink href="/take-action/get-involved">Get involved</NavDrawerLink>
          <NavDrawerLink href="/take-action/conserve">Conserve your land</NavDrawerLink>
          <NavDrawerLink href="/take-action/give">Give</NavDrawerLink>
        </NavDrawerGroup>
        <NavDrawerLink href="/find-a-land-trust">Find a Land Trust</NavDrawerLink>
        <NavDrawerLink href="/news">News</NavDrawerLink>
      </NavDrawer>
    </div>
  )
}

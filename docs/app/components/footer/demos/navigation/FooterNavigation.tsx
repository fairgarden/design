'use client'

import * as React from 'react'
import { Button } from '@fairgarden-private/design/components/Button'
import { Footer } from '@fairgarden-private/design/components/Footer'
import { NavDrawer, NavDrawerFooter, NavDrawerLink } from '@fairgarden-private/design/components/NavDrawer'
import { NavigationBar } from '@fairgarden-private/design/components/NavigationBar'
import { NavigationMenu, NavigationMenuSections } from '@fairgarden-private/design/components/NavigationMenu'
import { navigation } from './navigation'
import styles from './navigation.module.css'

/**
 * One navigation object feeds the header's menu (from 1024 px), the drawer
 * (below it; narrow the window) and the footer sitemap, so the footer
 * mirrors the mega panels [D187]. The page sits in What We Do › Our programs.
 */
export function FooterNavigation() {
  return (
    <div className={styles.page}>
      <NavigationBar
        logo={<span className={styles.logo}>FairGarden</span>}
        logoLabel="FairGarden home"
        currentPath="/what-we-do/our-programs"
        skipHref="#navigation-demo-content"
        action={
          <Button variant="solid" size="sm" nativeButton={false} render={<a href="/donate" />}>
            Donate
          </Button>
        }
        drawer={
          <NavDrawer
            sections={navigation}
            footer={
              <NavDrawerFooter
                action={
                  <Button variant="solid" size="lg" nativeButton={false} render={<a href="/donate" />}>
                    Donate
                  </Button>
                }
              >
                <NavDrawerLink href="/about">About</NavDrawerLink>
                <NavDrawerLink href="/accessibility">Accessibility settings</NavDrawerLink>
              </NavDrawerFooter>
            }
          />
        }
      >
        <NavigationMenu>
          <NavigationMenuSections sections={navigation} />
        </NavigationMenu>
      </NavigationBar>
      <div id="navigation-demo-content" className={styles.content} tabIndex={-1}>
        Page content starts here.
      </div>
      <Footer
        brand={
          <a href="/" className={styles.footerLogo}>
            FairGarden
          </a>
        }
        sitemap={navigation}
        legal={[
          { label: 'Privacy', href: '/privacy' },
          { label: 'Accessibility', href: '/accessibility' },
        ]}
        copyright="© 2026 FairGarden"
        organization="FairGarden"
        backToTop={{ href: '#navigation-demo-content' }}
      />
    </div>
  )
}

'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import { Footer } from '@fairgarden/design/page/footer'
import { NavDrawer, NavDrawerFooter, NavDrawerLink } from '@fairgarden/design/navigation/nav-drawer'
import { NavigationBar } from '@fairgarden/design/navigation/navigation-bar'
import { NavigationMenu, NavigationMenuSections } from '@fairgarden/design/navigation/navigation-menu'
import { Lockup } from '@/components/Logo'
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
        logo={<Lockup />}
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
            <Lockup />
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

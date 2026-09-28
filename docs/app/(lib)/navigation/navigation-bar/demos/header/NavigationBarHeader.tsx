'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import {
  NavDrawer,
  NavDrawerFooter,
  NavDrawerGroup,
  NavDrawerLink,
} from '@fairgarden/design/navigation/nav-drawer'
import {
  NavigationBar,
  NavigationBarUtility,
  NavigationBarUtilityLink,
} from '@fairgarden/design/navigation/navigation-bar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuFeatured,
  NavigationMenuGroup,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuPromo,
  NavigationMenuTrigger,
} from '@fairgarden/design/navigation/navigation-menu'
import { Search } from '@fairgarden/design/forms/search'
import { Lockup } from '@/components/Logo'
import { photo } from './photo'
import styles from './header.module.css'

/**
 * The full header on a page in Programs › Garden Programs: skip link, brand
 * strip, utility row, logo, the inline menu from 1024 px, search, the one
 * action, and the drawer below 1024 px. The docs show it in a frame that is
 * its own viewport, so the bar answers to the frame's width; open the full
 * page to see the inline menu at the window's width.
 */
export function NavigationBarHeader() {
  return (
    <div className={styles.page}>
      <NavigationBar
        logo={<Lockup />}
        logoLabel="FairGarden home"
        currentPath="/programs/gardens"
        skipHref="#header-demo-content"
        utility={
          <NavigationBarUtility>
            <NavigationBarUtilityLink href="/about">About</NavigationBarUtilityLink>
            <NavigationBarUtilityLink href="/jobs">Job Board</NavigationBarUtilityLink>
            <NavigationBarUtilityLink href="/newsroom">Newsroom</NavigationBarUtilityLink>
            <NavigationBarUtilityLink href="/blog">Blog</NavigationBarUtilityLink>
          </NavigationBarUtility>
        }
        search={<Search kind="trigger" label="Search FairGarden" />}
        action={
          <Button variant="solid" size="sm" nativeButton={false} render={<a href="/donate" />}>
            Donate
          </Button>
        }
        drawer={
          <NavDrawer
            footer={
              <NavDrawerFooter
                action={
                  <Button variant="solid" size="lg" nativeButton={false} render={<a href="/donate" />}>
                    Donate
                  </Button>
                }
              >
                <NavDrawerLink href="/about">About</NavDrawerLink>
                <NavDrawerLink href="/newsroom">Newsroom</NavDrawerLink>
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
              <NavDrawerLink href="/get-involved">Get involved</NavDrawerLink>
              <NavDrawerLink href="/get-involved/volunteer">Volunteer</NavDrawerLink>
              <NavDrawerLink href="/get-involved/give">Give</NavDrawerLink>
            </NavDrawerGroup>
            <NavDrawerLink href="/find-a-garden">Find a Garden</NavDrawerLink>
          </NavDrawer>
        }
      >
        <NavigationMenu>
          <NavigationMenuItem>
            <NavigationMenuTrigger section="/our-work">Our Work</NavigationMenuTrigger>
            <NavigationMenuContent
              kind="overview"
              featured={
                <NavigationMenuFeatured
                  href="/our-work"
                  description="Why shared gardens make stronger towns."
                >
                  Our Work
                </NavigationMenuFeatured>
              }
              promo={
                <NavigationMenuPromo
                  href="/our-work/grown-close-to-home"
                  title="Grown Close to Home"
                  image={<img src={photo} alt="Raised beds on a hillside above a river valley" />}
                >
                  Shared plots cool our streets, feed our families and bring neighbors out.
                </NavigationMenuPromo>
              }
            >
              <NavigationMenuGroup heading="Stewardship" href="/our-work/stewardship">
                <NavigationMenuLink href="/our-work/stewardship/why-grow">Why grow together</NavigationMenuLink>
                <NavigationMenuLink href="/our-work/stewardship/agreements">
                  Garden land agreements
                </NavigationMenuLink>
              </NavigationMenuGroup>
              <NavigationMenuGroup heading="Priorities" href="/our-work/priorities">
                <NavigationMenuLink href="/our-work/priorities/climate">Climate</NavigationMenuLink>
                <NavigationMenuLink href="/our-work/priorities/water">Clean water</NavigationMenuLink>
                <NavigationMenuLink href="/our-work/priorities/food">Local food</NavigationMenuLink>
              </NavigationMenuGroup>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger section="/programs">Programs</NavigationMenuTrigger>
            <NavigationMenuContent
              kind="overview"
              featured={
                <NavigationMenuFeatured
                  href="/programs"
                  description="We help neighbors start, tend and keep the gardens they love."
                >
                  Programs
                </NavigationMenuFeatured>
              }
            >
              <NavigationMenuGroup heading="Garden Programs" href="/programs/gardens">
                <NavigationMenuLink href="/programs/gardens/plot-matching">Plot matching</NavigationMenuLink>
                <NavigationMenuLink href="/programs/gardens/seed-library">Seed library</NavigationMenuLink>
              </NavigationMenuGroup>
              <NavigationMenuGroup heading="Our Impact" href="/programs/impact">
                <NavigationMenuLink href="/programs/impact/harvest">Annual harvest count</NavigationMenuLink>
                <NavigationMenuLink href="/programs/impact/stories">Garden stories</NavigationMenuLink>
              </NavigationMenuGroup>
              <NavigationMenuGroup heading="Training" href="/programs/training">
                <NavigationMenuLink href="/programs/training/courses">Courses</NavigationMenuLink>
                <NavigationMenuLink href="/programs/training/gathering">Annual gathering</NavigationMenuLink>
              </NavigationMenuGroup>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger section="/get-involved">Get Involved</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/get-involved/volunteer">Volunteer</NavigationMenuLink>
              <NavigationMenuLink href="/get-involved/share-land">Share your land</NavigationMenuLink>
              <NavigationMenuLink href="/get-involved/give">Give</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink href="/find-a-garden">Find a Garden</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenu>
      </NavigationBar>
      <div id="header-demo-content" className={styles.content} tabIndex={-1}>
        Page content starts here.
      </div>
    </div>
  )
}

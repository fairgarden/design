'use client'

import * as React from 'react'
import { Button } from '@fairgarden-private/design/components/Button'
import {
  NavDrawer,
  NavDrawerFooter,
  NavDrawerGroup,
  NavDrawerLink,
} from '@fairgarden-private/design/components/NavDrawer'
import {
  NavigationBar,
  NavigationBarUtility,
  NavigationBarUtilityLink,
} from '@fairgarden-private/design/components/NavigationBar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuFeatured,
  NavigationMenuGroup,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuPromo,
  NavigationMenuTrigger,
} from '@fairgarden-private/design/components/NavigationMenu'
import { Search } from '@fairgarden-private/design/components/Search'
import { photo } from './photo'
import { Wordmark } from './Wordmark'
import styles from './header.module.css'

/**
 * The full header on a page in What We Do › Our Programs: skip link, brand
 * strip, utility row, logo, the inline menu from 1024 px, search, the one
 * action, and the drawer below 1024 px. The docs show it in a frame that is
 * its own viewport, so the bar answers to the frame's width; open the full
 * page to see the inline menu at the window's width.
 */
export function NavigationBarHeader() {
  return (
    <div className={styles.page}>
      <NavigationBar
        logo={<Wordmark />}
        logoLabel="FairGarden home"
        currentPath="/what-we-do/our-programs"
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
              <NavDrawerLink href="/take-action">Take action</NavDrawerLink>
              <NavDrawerLink href="/take-action/get-involved">Get involved</NavDrawerLink>
              <NavDrawerLink href="/take-action/give">Give</NavDrawerLink>
            </NavDrawerGroup>
            <NavDrawerLink href="/find-a-land-trust">Find a Land Trust</NavDrawerLink>
          </NavDrawer>
        }
      >
        <NavigationMenu>
          <NavigationMenuItem>
            <NavigationMenuTrigger section="/why-land-matters">Why Land Matters</NavigationMenuTrigger>
            <NavigationMenuContent
              kind="overview"
              featured={
                <NavigationMenuFeatured
                  href="/why-land-matters"
                  description="How saving land safeguards our future."
                >
                  Why Land Matters
                </NavigationMenuFeatured>
              }
              promo={
                <NavigationMenuPromo
                  href="/why-land-matters/land-is-the-answer"
                  title="Land Is the Answer"
                  image={<img src={photo} alt="A ridge of protected forest above a river valley" />}
                >
                  Protected land cleans our water, cools our towns and feeds our families.
                </NavigationMenuPromo>
              }
            >
              <NavigationMenuGroup heading="Land Conservation" href="/why-land-matters/land-conservation">
                <NavigationMenuLink href="/why-land-matters/land-conservation/why-conserve">
                  Why conserve land
                </NavigationMenuLink>
                <NavigationMenuLink href="/why-land-matters/land-conservation/easements">
                  Conservation easements
                </NavigationMenuLink>
              </NavigationMenuGroup>
              <NavigationMenuGroup heading="Conservation Priorities" href="/why-land-matters/priorities">
                <NavigationMenuLink href="/why-land-matters/priorities/climate">Climate</NavigationMenuLink>
                <NavigationMenuLink href="/why-land-matters/priorities/water">Clean water</NavigationMenuLink>
                <NavigationMenuLink href="/why-land-matters/priorities/farms">Farms and food</NavigationMenuLink>
              </NavigationMenuGroup>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger section="/what-we-do">What We Do</NavigationMenuTrigger>
            <NavigationMenuContent
              kind="overview"
              featured={
                <NavigationMenuFeatured
                  href="/what-we-do"
                  description="We help permanently protect the land that you need and love."
                >
                  What We Do
                </NavigationMenuFeatured>
              }
            >
              <NavigationMenuGroup heading="Our Programs" href="/what-we-do/our-programs">
                <NavigationMenuLink href="/what-we-do/our-programs/accreditation">Accreditation</NavigationMenuLink>
                <NavigationMenuLink href="/what-we-do/our-programs/policy">Policy and advocacy</NavigationMenuLink>
              </NavigationMenuGroup>
              <NavigationMenuGroup heading="Our Collective Impact" href="/what-we-do/impact">
                <NavigationMenuLink href="/what-we-do/impact/census">National land trust census</NavigationMenuLink>
                <NavigationMenuLink href="/what-we-do/impact/stories">Success stories</NavigationMenuLink>
              </NavigationMenuGroup>
              <NavigationMenuGroup heading="Training" href="/what-we-do/training">
                <NavigationMenuLink href="/what-we-do/training/courses">Courses</NavigationMenuLink>
                <NavigationMenuLink href="/what-we-do/training/rally">National conference</NavigationMenuLink>
              </NavigationMenuGroup>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger section="/take-action">Take Action</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/take-action/get-involved">Get involved</NavigationMenuLink>
              <NavigationMenuLink href="/take-action/conserve">Conserve your land</NavigationMenuLink>
              <NavigationMenuLink href="/take-action/give">Give</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink href="/find-a-land-trust">Find a Land Trust</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenu>
      </NavigationBar>
      <div id="header-demo-content" className={styles.content} tabIndex={-1}>
        Page content starts here.
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'
import { Search } from '@fairgarden-private/design/components/Search'
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
import { photo } from './photo'
import styles from './overview.module.css'

/**
 * Three LTA-style overview panels and one dropdown. The page sits in
 * What We Do › Our Programs, so What We Do shows the parent-of-current bar
 * and Our Programs is current inside its panel.
 */
export function NavigationMenuOverview() {
  return (
    <div className={styles.frame}>
      <NavigationMenu currentPath="/what-we-do/our-programs" className={styles.bar}>
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
              <NavigationMenuLink href="/why-land-matters/land-conservation/land-trusts">
                What a land trust does
              </NavigationMenuLink>
              <NavigationMenuLink href="/why-land-matters/land-conservation/stewardship">
                Caring for land forever
              </NavigationMenuLink>
            </NavigationMenuGroup>
            <NavigationMenuGroup heading="Conservation Priorities" href="/why-land-matters/priorities">
              <NavigationMenuLink href="/why-land-matters/priorities/climate">Climate</NavigationMenuLink>
              <NavigationMenuLink href="/why-land-matters/priorities/water">Clean water</NavigationMenuLink>
              <NavigationMenuLink href="/why-land-matters/priorities/farms">Farms and food</NavigationMenuLink>
              <NavigationMenuLink href="/why-land-matters/priorities/wildlife">Wildlife habitat</NavigationMenuLink>
              <NavigationMenuLink href="/why-land-matters/priorities/communities">
                Community-centered conservation
              </NavigationMenuLink>
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
            promo={
              <NavigationMenuPromo
                href="/what-we-do/gaining-ground"
                title="Together, Let's Keep Gaining Ground"
                image={<img src={photo} alt="Volunteers planting along a creek" />}
              >
                See how land trusts are protecting more land, in every state, every year.
              </NavigationMenuPromo>
            }
          >
            <NavigationMenuGroup heading="Our Programs" href="/what-we-do/our-programs">
              <NavigationMenuLink href="/what-we-do/our-programs/accreditation">Accreditation</NavigationMenuLink>
              <NavigationMenuLink href="/what-we-do/our-programs/conservation-defense">
                Conservation defense
              </NavigationMenuLink>
              <NavigationMenuLink href="/what-we-do/our-programs/policy">Policy and advocacy</NavigationMenuLink>
              <NavigationMenuLink href="/what-we-do/our-programs/grants">Grants</NavigationMenuLink>
              <NavigationMenuLink href="/what-we-do/our-programs/training">Training and events</NavigationMenuLink>
            </NavigationMenuGroup>
            <NavigationMenuGroup heading="Our Collective Impact" href="/what-we-do/impact">
              <NavigationMenuLink href="/what-we-do/impact/census">National land trust census</NavigationMenuLink>
              <NavigationMenuLink href="/what-we-do/impact/stories">Success stories</NavigationMenuLink>
              <NavigationMenuLink href="/what-we-do/impact/annual-report">Annual report</NavigationMenuLink>
            </NavigationMenuGroup>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger section="/take-action">Take Action</NavigationMenuTrigger>
          <NavigationMenuContent
            kind="overview"
            featured={
              <NavigationMenuFeatured href="/take-action" description="How you can make an impact.">
                Take Action
              </NavigationMenuFeatured>
            }
            search={<Search label="Find a land trust near you" placeholder="Search by name or town…" />}
            promo={
              <NavigationMenuPromo
                href="/take-action/give/stewards"
                title="Join Stewards of the Land"
                image={<img src={photo} alt="A farmer walking a hayfield at dusk" />}
              >
                Monthly gifts keep conserved land cared for, season after season.
              </NavigationMenuPromo>
            }
          >
            <NavigationMenuGroup heading="Get Involved" href="/take-action/get-involved">
              <NavigationMenuLink href="/take-action/get-involved/volunteer">Volunteer</NavigationMenuLink>
              <NavigationMenuLink href="/take-action/get-involved/events">Find an event</NavigationMenuLink>
              <NavigationMenuLink href="/take-action/get-involved/story">Share your story</NavigationMenuLink>
            </NavigationMenuGroup>
            <NavigationMenuGroup heading="Conserve Your Land" href="/take-action/conserve">
              <NavigationMenuLink href="/take-action/conserve/options">Conservation options</NavigationMenuLink>
              <NavigationMenuLink href="/take-action/conserve/tax">Tax benefits</NavigationMenuLink>
              <NavigationMenuLink href="/take-action/conserve/talk">Talk to a land trust</NavigationMenuLink>
            </NavigationMenuGroup>
            <NavigationMenuGroup heading="Give" href="/take-action/give">
              <NavigationMenuLink href="/take-action/give/donate">Donate</NavigationMenuLink>
              <NavigationMenuLink href="/take-action/give/monthly">Give monthly</NavigationMenuLink>
              <NavigationMenuLink href="/take-action/give/legacy">Leave a legacy</NavigationMenuLink>
            </NavigationMenuGroup>
            <NavigationMenuGroup heading="Partner" href="/take-action/partner">
              <NavigationMenuLink href="/take-action/partner/business">Business partnerships</NavigationMenuLink>
            </NavigationMenuGroup>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger section="/about">About</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/about/story">Our story</NavigationMenuLink>
            <NavigationMenuLink href="/about/staff">Staff and board</NavigationMenuLink>
            <NavigationMenuLink href="/about/careers">Careers</NavigationMenuLink>
            <NavigationMenuLink href="/about/contact">Contact</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenu>
    </div>
  )
}

'use client'

import * as React from 'react'
import { Search } from '@fairgarden/design/forms/search'
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
import { photo } from './photo'
import styles from './overview.module.css'

/**
 * Three overview panels and one dropdown. The page sits in
 * Programs › Garden Programs, so Programs shows the parent-of-current bar
 * and Garden Programs is current inside its panel.
 */
export function NavigationMenuOverview() {
  return (
    <div className={styles.frame}>
      <NavigationMenu currentPath="/programs/gardens" className={styles.bar}>
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
              <NavigationMenuLink href="/our-work/stewardship/stewards">
                What a garden steward does
              </NavigationMenuLink>
              <NavigationMenuLink href="/our-work/stewardship/soil">
                Caring for soil for good
              </NavigationMenuLink>
            </NavigationMenuGroup>
            <NavigationMenuGroup heading="Priorities" href="/our-work/priorities">
              <NavigationMenuLink href="/our-work/priorities/climate">Climate</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/priorities/water">Clean water</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/priorities/food">Local food</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/priorities/pollinators">Pollinator habitat</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/priorities/neighbors">
                Neighbor-led stewardship
              </NavigationMenuLink>
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
            promo={
              <NavigationMenuPromo
                href="/programs/every-block"
                title="Together, Let's Grow Every Block"
                image={<img src={photo} alt="Volunteers planting along a creek" />}
              >
                See how new plots opened this year, from school yards to church lots.
              </NavigationMenuPromo>
            }
          >
            <NavigationMenuGroup heading="Garden Programs" href="/programs/gardens">
              <NavigationMenuLink href="/programs/gardens/plot-matching">Plot matching</NavigationMenuLink>
              <NavigationMenuLink href="/programs/gardens/seed-library">Seed library</NavigationMenuLink>
              <NavigationMenuLink href="/programs/gardens/tool-share">Tool share</NavigationMenuLink>
              <NavigationMenuLink href="/programs/gardens/grants">Grants</NavigationMenuLink>
              <NavigationMenuLink href="/programs/gardens/training">Training and events</NavigationMenuLink>
            </NavigationMenuGroup>
            <NavigationMenuGroup heading="Our Impact" href="/programs/impact">
              <NavigationMenuLink href="/programs/impact/harvest">Annual harvest count</NavigationMenuLink>
              <NavigationMenuLink href="/programs/impact/stories">Garden stories</NavigationMenuLink>
              <NavigationMenuLink href="/programs/impact/annual-report">Annual report</NavigationMenuLink>
            </NavigationMenuGroup>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger section="/get-involved">Get Involved</NavigationMenuTrigger>
          <NavigationMenuContent
            kind="overview"
            featured={
              <NavigationMenuFeatured href="/get-involved" description="Ways to pitch in this season.">
                Get Involved
              </NavigationMenuFeatured>
            }
            search={<Search label="Find a garden near you" placeholder="Search by street or town…" />}
            promo={
              <NavigationMenuPromo
                href="/get-involved/give/keepers"
                title="Join the Garden Keepers"
                image={<img src={photo} alt="A gardener watering raised beds at dusk" />}
              >
                Monthly gifts keep shared gardens tended, season after season.
              </NavigationMenuPromo>
            }
          >
            <NavigationMenuGroup heading="Volunteer" href="/get-involved/volunteer">
              <NavigationMenuLink href="/get-involved/volunteer/work-days">Join a work day</NavigationMenuLink>
              <NavigationMenuLink href="/get-involved/volunteer/events">Find an event</NavigationMenuLink>
              <NavigationMenuLink href="/get-involved/volunteer/story">Share your story</NavigationMenuLink>
            </NavigationMenuGroup>
            <NavigationMenuGroup heading="Share Your Land" href="/get-involved/share-land">
              <NavigationMenuLink href="/get-involved/share-land/options">Lending options</NavigationMenuLink>
              <NavigationMenuLink href="/get-involved/share-land/tax">Tax benefits</NavigationMenuLink>
              <NavigationMenuLink href="/get-involved/share-land/talk">Talk to our team</NavigationMenuLink>
            </NavigationMenuGroup>
            <NavigationMenuGroup heading="Give" href="/get-involved/give">
              <NavigationMenuLink href="/get-involved/give/donate">Donate</NavigationMenuLink>
              <NavigationMenuLink href="/get-involved/give/monthly">Give monthly</NavigationMenuLink>
              <NavigationMenuLink href="/get-involved/give/legacy">Leave a legacy</NavigationMenuLink>
            </NavigationMenuGroup>
            <NavigationMenuGroup heading="Partner" href="/get-involved/partner">
              <NavigationMenuLink href="/get-involved/partner/business">Business partnerships</NavigationMenuLink>
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

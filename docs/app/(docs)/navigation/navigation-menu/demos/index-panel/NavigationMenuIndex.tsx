'use client'

import * as React from 'react'
import {
  NavigationMenu,
  NavigationMenuCategory,
  NavigationMenuContent,
  NavigationMenuFeaturedBar,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '@fairgarden/design/navigation/navigation-menu'
import styles from './index-panel.module.css'

/**
 * Index panels: a category list beside the selected category's links,
 * with a featured bar across both. The page is a plant profile, so
 * Garden Guide is the parent of current and Plant Profiles opens
 * selected.
 */
export function NavigationMenuIndex() {
  return (
    <div className={styles.frame}>
      <NavigationMenu currentPath="/guide/plants/butternut-squash" className={styles.bar}>
        <NavigationMenuItem>
          <NavigationMenuTrigger section="/our-work">Our Work</NavigationMenuTrigger>
          <NavigationMenuContent
            kind="index"
            featuredBar={
              <NavigationMenuFeaturedBar href="/our-work">See All of Our Work</NavigationMenuFeaturedBar>
            }
          >
            <NavigationMenuCategory label="Stewardship">
              <NavigationMenuLink href="/our-work/stewardship/meadows">Meadows</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/stewardship/hedgerows">Orchards and hedgerows</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/stewardship/rain-gardens">Rain gardens</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/stewardship/soil">Soil and compost</NavigationMenuLink>
            </NavigationMenuCategory>
            <NavigationMenuCategory label="Climate">
              <NavigationMenuLink href="/our-work/climate/report">Cooler blocks report</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/climate/shade">Shade and tree canopy</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/climate/rain">Rain capture</NavigationMenuLink>
            </NavigationMenuCategory>
            <NavigationMenuCategory label="Garden Science">
              <NavigationMenuLink href="/our-work/science/count">Pollinator count</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/science/soil">Soil testing</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/science/data">Open data</NavigationMenuLink>
            </NavigationMenuCategory>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger section="/guide">Garden Guide</NavigationMenuTrigger>
          <NavigationMenuContent
            kind="index"
            featuredBar={
              <NavigationMenuFeaturedBar href="/guide/for-your-plot">
                Find Plants That Suit Your Plot
              </NavigationMenuFeaturedBar>
            }
          >
            <NavigationMenuCategory label="Visit">
              <NavigationMenuLink href="/guide/visit/map">Garden map</NavigationMenuLink>
              <NavigationMenuLink href="/guide/visit/walks">Guided walks</NavigationMenuLink>
              <NavigationMenuLink href="/guide/visit/seed-libraries">Seed libraries</NavigationMenuLink>
            </NavigationMenuCategory>
            <NavigationMenuCategory label="Plant Profiles">
              <NavigationMenuLink href="/guide/plants/squashes">Squashes</NavigationMenuLink>
              <NavigationMenuLink href="/guide/plants/butternut-squash">Butternut squash</NavigationMenuLink>
              <NavigationMenuLink href="/guide/plants/beans">Beans</NavigationMenuLink>
              <NavigationMenuLink href="/guide/plants/leafy-greens">Leafy greens</NavigationMenuLink>
            </NavigationMenuCategory>
            <NavigationMenuCategory label="Grow at Home">
              <NavigationMenuLink href="/guide/home/native-plants">Native plants</NavigationMenuLink>
              <NavigationMenuLink href="/guide/home/containers">Container beds</NavigationMenuLink>
              <NavigationMenuLink href="/guide/home/compost">Compost and mulch</NavigationMenuLink>
            </NavigationMenuCategory>
            <NavigationMenuCategory label="Photography">
              <NavigationMenuLink href="/guide/photo/contest">Photo contest</NavigationMenuLink>
              <NavigationMenuLink href="/guide/photo/tips">Garden photo tips</NavigationMenuLink>
            </NavigationMenuCategory>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger section="/get-involved">Get Involved</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/get-involved/volunteer">Volunteer</NavigationMenuLink>
            <NavigationMenuLink href="/get-involved/gardens">Find a garden</NavigationMenuLink>
            <NavigationMenuLink href="/get-involved/advocate">Advocate</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink href="/news">News</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenu>
    </div>
  )
}

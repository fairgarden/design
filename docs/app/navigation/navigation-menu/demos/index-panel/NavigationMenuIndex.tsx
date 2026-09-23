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
 * Audubon-style index panels: a category list beside the selected
 * category's links, with a featured bar across both. The page is an owl
 * species page, so Explore Birds is the parent of current and Bird Guide
 * opens selected.
 */
export function NavigationMenuIndex() {
  return (
    <div className={styles.frame}>
      <NavigationMenu currentPath="/explore/bird-guide/great-horned-owl" className={styles.bar}>
        <NavigationMenuItem>
          <NavigationMenuTrigger section="/our-work">Our Work</NavigationMenuTrigger>
          <NavigationMenuContent
            kind="index"
            featuredBar={
              <NavigationMenuFeaturedBar href="/our-work">See All of Our Work</NavigationMenuFeaturedBar>
            }
          >
            <NavigationMenuCategory label="Conservation">
              <NavigationMenuLink href="/our-work/conservation/grasslands">Grasslands</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/conservation/coasts">Coasts and shorelines</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/conservation/forests">Working forests</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/conservation/water">Water in the West</NavigationMenuLink>
            </NavigationMenuCategory>
            <NavigationMenuCategory label="Climate">
              <NavigationMenuLink href="/our-work/climate/report">Survival by degrees</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/climate/solutions">Natural climate solutions</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/climate/energy">Clean energy siting</NavigationMenuLink>
            </NavigationMenuCategory>
            <NavigationMenuCategory label="Community Science">
              <NavigationMenuLink href="/our-work/science/count">Winter bird count</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/science/watch">Climate watch</NavigationMenuLink>
              <NavigationMenuLink href="/our-work/science/data">Open data</NavigationMenuLink>
            </NavigationMenuCategory>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger section="/explore">Explore Birds</NavigationMenuTrigger>
          <NavigationMenuContent
            kind="index"
            featuredBar={
              <NavigationMenuFeaturedBar href="/explore/near-you">
                Search for Birds in Your Area
              </NavigationMenuFeaturedBar>
            }
          >
            <NavigationMenuCategory label="Birds Near You">
              <NavigationMenuLink href="/explore/near-you/map">Bird map</NavigationMenuLink>
              <NavigationMenuLink href="/explore/near-you/walks">Guided walks</NavigationMenuLink>
              <NavigationMenuLink href="/explore/near-you/centers">Nature centers</NavigationMenuLink>
            </NavigationMenuCategory>
            <NavigationMenuCategory label="Bird Guide">
              <NavigationMenuLink href="/explore/bird-guide/owls">Owls</NavigationMenuLink>
              <NavigationMenuLink href="/explore/bird-guide/great-horned-owl">Great horned owl</NavigationMenuLink>
              <NavigationMenuLink href="/explore/bird-guide/warblers">Warblers</NavigationMenuLink>
              <NavigationMenuLink href="/explore/bird-guide/shorebirds">Shorebirds</NavigationMenuLink>
            </NavigationMenuCategory>
            <NavigationMenuCategory label="Bird-Friendly Living">
              <NavigationMenuLink href="/explore/living/plants">Native plants</NavigationMenuLink>
              <NavigationMenuLink href="/explore/living/windows">Safer windows</NavigationMenuLink>
              <NavigationMenuLink href="/explore/living/feeders">Feeders and baths</NavigationMenuLink>
            </NavigationMenuCategory>
            <NavigationMenuCategory label="Photography">
              <NavigationMenuLink href="/explore/photo/awards">Photo awards</NavigationMenuLink>
              <NavigationMenuLink href="/explore/photo/ethics">Ethical bird photography</NavigationMenuLink>
            </NavigationMenuCategory>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger section="/get-involved">Get Involved</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/get-involved/volunteer">Volunteer</NavigationMenuLink>
            <NavigationMenuLink href="/get-involved/chapters">Find a chapter</NavigationMenuLink>
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

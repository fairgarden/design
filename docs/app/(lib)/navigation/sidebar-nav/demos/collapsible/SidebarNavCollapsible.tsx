import * as React from 'react'
import { SidebarNav, type SidebarNavItem } from '@fairgarden/design/navigation/sidebar-nav'
import styles from './collapsible.module.css'

/** A longer tree: each group folds away, and the one holding the current page starts open. */
const handbook: SidebarNavItem[] = [
  {
    title: 'Getting started',
    href: '/handbook',
    items: [
      { title: 'Welcome', href: '/handbook/welcome' },
      { title: 'Your first season', href: '/handbook/first-season' },
      { title: 'Plot agreements', href: '/handbook/plot-agreements' },
    ],
  },
  {
    title: 'Garden care',
    href: '/handbook/garden-care',
    items: [
      { title: 'Soil and beds', href: '/handbook/soil' },
      { title: 'Watering', href: '/handbook/watering' },
      { title: 'Composting', href: '/handbook/composting' },
      { title: 'Seed saving', href: '/handbook/seed-saving' },
    ],
  },
  {
    title: 'Shared spaces',
    href: '/handbook/shared-spaces',
    items: [
      { title: 'Tool shed', href: '/handbook/tool-shed' },
      { title: 'Water points', href: '/handbook/water-points' },
      { title: 'Work days', href: '/handbook/work-days' },
    ],
  },
  {
    // A group without an index page: its whole heading row is the toggle.
    title: 'Forms',
    items: [
      { title: 'Plot application', href: '/handbook/forms/plot-application' },
      { title: 'Tool loan', href: '/handbook/forms/tool-loan' },
      { title: 'Work-day sign-up', href: '/handbook/forms/work-day' },
    ],
  },
]

/** Collapsible groups: the heading links to the group's page, the glyph beside it folds the group. */
export function SidebarNavCollapsible() {
  return (
    <div className={styles.column}>
      <SidebarNav items={handbook} currentPath="/handbook/watering" label="Handbook" collapsible />
    </div>
  )
}

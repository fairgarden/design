import type { SidebarNavItem } from '@fairgarden/design/navigation/sidebar-nav'

/** The community garden handbook's page tree: plain data, as a sitemap or CMS would give it. */
export const handbook: SidebarNavItem[] = [
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
      {
        title: 'Composting',
        href: '/handbook/composting',
        items: [
          { title: 'Hot compost', href: '/handbook/composting/hot' },
          { title: 'Worm bins', href: '/handbook/composting/worms' },
        ],
      },
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
]

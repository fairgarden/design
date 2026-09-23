import type { SitemapSection } from '@fairgarden/design/utils/navigation';

/** The navigation data: the same sections feed the Navigation Menu panels and the footer sitemap. */
export const sitemap: readonly SitemapSection[] = [
  {
    label: 'Why Land Matters',
    href: '/why-land-matters',
    links: [
      { label: 'Climate', href: '/why-land-matters/climate' },
      { label: 'Clean Water', href: '/why-land-matters/water', current: true },
      { label: 'Wildlife', href: '/why-land-matters/wildlife' },
      { label: 'Farms and Food', href: '/why-land-matters/farms' },
    ],
  },
  {
    label: 'What We Do',
    href: '/what-we-do',
    links: [
      { label: 'Conservation Easements', href: '/what-we-do/easements' },
      { label: 'Stewardship', href: '/what-we-do/stewardship' },
      { label: 'Policy', href: '/what-we-do/policy' },
    ],
  },
  {
    label: 'Take Action',
    href: '/take-action',
    links: [
      { label: 'Donate', href: '/take-action/donate' },
      { label: 'Volunteer', href: '/take-action/volunteer' },
      { label: 'Events', href: '/take-action/events' },
    ],
  },
  {
    label: 'Find a Land Trust',
    links: [
      { label: 'Search the Map', href: '/find' },
      { label: 'Land Trust Alliance', href: 'https://example.org/alliance', external: true },
    ],
  },
];

/** A larger sitemap (more than 24 links): its groups collapse into an Accordion on phones. */
export const largeSitemap: readonly SitemapSection[] = sitemap.map((section) => ({
  ...section,
  links: [
    ...section.links,
    ...['Stories', 'Reports', 'Maps', 'Guides'].map((label) => ({
      label: `${label}: ${section.label}`,
      href: `${section.href ?? '/find'}/${label.toLowerCase()}`,
    })),
  ],
}));

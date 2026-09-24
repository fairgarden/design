import type { SitemapSection } from '@fairgarden/design/utils/navigation';

/** The navigation data: the same sections feed the Navigation Menu panels and the footer sitemap. */
export const sitemap: readonly SitemapSection[] = [
  {
    label: 'Our Work',
    href: '/our-work',
    links: [
      { label: 'Climate', href: '/our-work/climate' },
      { label: 'Clean Water', href: '/our-work/water', current: true },
      { label: 'Pollinators', href: '/our-work/pollinators' },
      { label: 'Local Food', href: '/our-work/food' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    links: [
      { label: 'Garden Land Agreements', href: '/programs/agreements' },
      { label: 'Stewardship', href: '/programs/stewardship' },
      { label: 'Policy', href: '/programs/policy' },
    ],
  },
  {
    label: 'Get Involved',
    href: '/get-involved',
    links: [
      { label: 'Donate', href: '/get-involved/donate' },
      { label: 'Volunteer', href: '/get-involved/volunteer' },
      { label: 'Events', href: '/get-involved/events' },
    ],
  },
  {
    label: 'Find a Garden',
    links: [
      { label: 'Search the Map', href: '/find' },
      { label: 'Regional Garden Network', href: 'https://example.org/network', external: true },
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

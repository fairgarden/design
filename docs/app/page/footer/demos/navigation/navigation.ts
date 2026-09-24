import type { Sitemap } from '@fairgarden/design/utils/navigation';

/** A flat 16:9 placeholder (inline SVG), standing in for a photograph in this demo. */
const photo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">' +
      '<rect width="320" height="180" fill="#b8c4a8"/>' +
      '<path d="M0 132 84 70l58 44 46-32 132 86v12H0z" fill="#5f6f4e"/>' +
      '</svg>',
  );

/**
 * The site's navigation, written once. The Navigation Menu builds its panels
 * from it, the drawer its groups and the footer its sitemap [D187]. A link
 * with its own `links` is a third tier that only the mega panels show.
 */
export const navigation: Sitemap = [
  {
    label: 'Our Work',
    href: '/our-work',
    description: 'Why shared gardens make stronger towns.',
    promo: {
      href: '/our-work/grown-close-to-home',
      title: 'Grown Close to Home',
      image: { src: photo, alt: 'Raised beds on a hillside above a river valley' },
      description: 'Shared plots cool our streets, feed our families and bring neighbors out.',
    },
    links: [
      {
        label: 'Stewardship',
        href: '/our-work/stewardship',
        links: [
          { label: 'Why grow together', href: '/our-work/stewardship/why-grow' },
          { label: 'Garden land agreements', href: '/our-work/stewardship/agreements' },
        ],
      },
      {
        label: 'Priorities',
        href: '/our-work/priorities',
        links: [
          { label: 'Climate', href: '/our-work/priorities/climate' },
          { label: 'Clean water', href: '/our-work/priorities/water' },
          { label: 'Local food', href: '/our-work/priorities/food' },
        ],
      },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    panel: 'index',
    featured: { label: 'Read the 2026 harvest report', href: '/programs/impact/report-2026' },
    links: [
      {
        label: 'Garden programs',
        href: '/programs/gardens',
        // The footer has no path to match, so the data marks the current page.
        current: true,
        links: [
          { label: 'Plot matching', href: '/programs/gardens/plot-matching' },
          { label: 'Seed library', href: '/programs/gardens/seed-library' },
        ],
      },
      {
        label: 'Our impact',
        href: '/programs/impact',
        links: [
          { label: 'Annual harvest count', href: '/programs/impact/harvest' },
          { label: 'Garden stories', href: '/programs/impact/stories' },
        ],
      },
      { label: 'Training', href: '/programs/training' },
    ],
  },
  {
    label: 'Get Involved',
    href: '/get-involved',
    links: [
      { label: 'Volunteer', href: '/get-involved/volunteer' },
      { label: 'Share your land', href: '/get-involved/share-land' },
      { label: 'Give', href: '/get-involved/give' },
    ],
  },
  { label: 'Find a Garden', href: '/find-a-garden', links: [] },
];

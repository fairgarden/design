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
    label: 'Why Land Matters',
    href: '/why-land-matters',
    description: 'How saving land safeguards our future.',
    promo: {
      href: '/why-land-matters/land-is-the-answer',
      title: 'Land Is the Answer',
      image: { src: photo, alt: 'A ridge of protected forest above a river valley' },
      description: 'Protected land cleans our water, cools our towns and feeds our families.',
    },
    links: [
      {
        label: 'Land conservation',
        href: '/why-land-matters/land-conservation',
        links: [
          { label: 'Why conserve land', href: '/why-land-matters/land-conservation/why-conserve' },
          { label: 'Conservation easements', href: '/why-land-matters/land-conservation/easements' },
        ],
      },
      {
        label: 'Conservation priorities',
        href: '/why-land-matters/priorities',
        links: [
          { label: 'Climate', href: '/why-land-matters/priorities/climate' },
          { label: 'Clean water', href: '/why-land-matters/priorities/water' },
          { label: 'Farms and food', href: '/why-land-matters/priorities/farms' },
        ],
      },
    ],
  },
  {
    label: 'What We Do',
    href: '/what-we-do',
    panel: 'index',
    featured: { label: 'Read the 2026 land trust census', href: '/what-we-do/impact/census-2026' },
    links: [
      {
        label: 'Our programs',
        href: '/what-we-do/our-programs',
        // The footer has no path to match, so the data marks the current page.
        current: true,
        links: [
          { label: 'Accreditation', href: '/what-we-do/our-programs/accreditation' },
          { label: 'Policy and advocacy', href: '/what-we-do/our-programs/policy' },
        ],
      },
      {
        label: 'Our collective impact',
        href: '/what-we-do/impact',
        links: [
          { label: 'National land trust census', href: '/what-we-do/impact/census' },
          { label: 'Success stories', href: '/what-we-do/impact/stories' },
        ],
      },
      { label: 'Training', href: '/what-we-do/training' },
    ],
  },
  {
    label: 'Take Action',
    href: '/take-action',
    links: [
      { label: 'Get involved', href: '/take-action/get-involved' },
      { label: 'Conserve your land', href: '/take-action/conserve' },
      { label: 'Give', href: '/take-action/give' },
    ],
  },
  { label: 'Find a Land Trust', href: '/find-a-land-trust', links: [] },
];

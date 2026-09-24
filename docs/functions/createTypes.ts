import 'server-only'

import {
  createMultipleTypesFactory,
  createTypesFactory,
} from '@fairgarden/design/utils/docs/createTypes'
import { mdxComponents } from '@/mdx-components'

/**
 * API table for one export, extracted from TypeScript at build time, in the
 * design system's Types Table; descriptions render with the site's MDX map.
 * @param url `import.meta.url` of the page's types.ts.
 * @param component The export to document.
 */
export const createTypes = createTypesFactory({ components: mdxComponents })

/** API tables for several related exports, rendered as `<TypesX.Part />`. */
export const createMultipleTypes = createMultipleTypesFactory({ components: mdxComponents })

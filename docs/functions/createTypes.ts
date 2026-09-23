import 'server-only'

import {
  createMultipleTypesFactory,
  createTypesFactory,
} from '@fairgarden/docs/abstractCreateTypes'
import type { AbstractCreateTypesOptions } from '@fairgarden/docs/abstractCreateTypes'
import { mdxComponents } from '@/mdx-components'
import { TypesTable } from '@/components/TypesTable'
import { TypePre } from '@/components/TypePre'

const options = {
  TypesTable,
  components: mdxComponents,
  TypePre,
} satisfies AbstractCreateTypesOptions

/**
 * API table for one export, extracted from TypeScript at build time.
 * @param url `import.meta.url` of the page's types.ts.
 * @param component The export to document.
 */
export const createTypes = createTypesFactory(options)

/** API tables for several related exports, rendered as `<TypesX.Part />`. */
export const createMultipleTypes = createMultipleTypesFactory(options)

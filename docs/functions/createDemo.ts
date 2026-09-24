import 'server-only'

import {
  createDemoFactory,
  createDemoWithVariantsFactory,
} from '@fairgarden/design/utils/docs/createDemo'
import { DemoContent } from '@/components/DemoContent'
import { DemoLoading } from '@/components/DemoLoading'

// The design system's pre-wired factories, with the site's page modes
// (the staged page and the page-frame preview) around its Demo.
const options = { DemoContent, DemoContentLoading: DemoLoading }

/**
 * Creates a demo: the component rendered above its highlighted source.
 * @param url `import.meta.url` of the demo's index.ts.
 * @param component The component to render.
 * @param meta Optional `name`, `slug` and display options.
 */
export const createDemo = createDemoFactory(options)

/** As `createDemo`, with switchable variants of the same demo. */
export const createDemoWithVariants = createDemoWithVariantsFactory(options)

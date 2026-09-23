import 'server-only'

import {
  createDemoFactory,
  createDemoWithVariantsFactory,
} from '@fairgarden/docs/abstractCreateDemo'
import { DemoContent } from '@/components/DemoContent'
import { DemoTitle } from '@/components/DemoTitle'

// Set by withDeploymentConfig: turns file:// source URLs into GitHub links.
const projectDir = process.env.SOURCE_CODE_ROOT_DIR
const projectUrl = process.env.SOURCE_CODE_ROOT_URL

/**
 * Creates a demo: the component rendered above its highlighted source.
 * @param url `import.meta.url` of the demo's index.ts.
 * @param component The component to render.
 * @param meta Optional `name`, `slug` and display options.
 */
export const createDemo = createDemoFactory({ DemoContent, DemoTitle, projectDir, projectUrl })

/** As `createDemo`, with switchable variants of the same demo. */
export const createDemoWithVariants = createDemoWithVariantsFactory({
  DemoContent,
  DemoTitle,
  projectDir,
  projectUrl,
})

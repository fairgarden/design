import createMDX from '@next/mdx'
import type { NextConfig } from 'next'
import {
  getFairGardenDocsMdxOptions,
  withDeploymentConfig,
  withFairGardenDocs,
} from '@fairgarden/docs/withFairGardenDocs'

// Declared outside the call: `indexWrapperComponent` is honoured at runtime
// but missing from the published type, so an inline object literal would fail
// the excess-property check when Next type-checks this file.
const extractToIndex = {
  include: ['app/overview', 'app/components'],
  exclude: [],
  indexWrapperComponent: 'PagesIndex',
}

const withMDX = createMDX({
  options: getFairGardenDocsMdxOptions({
    // Plugin names are resolved from each .mdx file's directory, so every one
    // must be a direct dependency of this package.
    additionalRehypePlugins: ['rehype-slug'],
    extractToIndex,
  }),
})

const nextConfig: NextConfig = {
  // Parallel dev servers (e.g. QA agents) can each use their own build dir.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // withDeploymentConfig defaults both of these the other way.
  trailingSlash: false,
  typescript: { ignoreBuildErrors: false },
}

export default withDeploymentConfig(
  withFairGardenDocs({
    // The default (true) sets output: 'export', which breaks `next start`.
    enableExportOutput: false,
    // `pnpm validate` writes a page.tsx beside each demo, so the
    // "[See Demo](./demos/x/)" links resolve.
    requireDemoPage: true,
  })(withMDX(nextConfig)),
)

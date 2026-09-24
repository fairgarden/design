import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
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
  include: [
    'app/overview',
    'app/foundations',
    'app/actions',
    'app/navigation',
    'app/forms',
    'app/feedback',
    'app/overlays',
    'app/disclosure',
    'app/page',
    'app/content',
    'app/data',
  ],
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

// Turbopack resolves nothing outside its root, which it puts at the nearest
// lockfile: this module's own pnpm-lock.yaml. Installed from the monorepo
// root, `next` and the other dependencies live in the monorepo's store above
// it, so the root is the directory whose node_modules holds the `next` this
// site resolves: the module on its own, or the monorepo around it. (Next runs
// this file from the docs directory, as it does the PostCSS config.)
const nextPackage = realpathSync(
  createRequire(path.join(process.cwd(), 'package.json')).resolve('next/package.json'),
)
const installRoot = nextPackage.slice(0, nextPackage.indexOf(`${path.sep}node_modules${path.sep}`))

const nextConfig: NextConfig = {
  // Parallel dev servers (e.g. QA agents) can each use their own build dir.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  turbopack: { root: installRoot },
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
    // Demo loaders also emit a JavaScript version of each TypeScript file,
    // so demos offer the TS | JS switch.
    transformTypescriptToJavascript: true,
  })(withMDX(nextConfig)),
)

import {
  createDemoFactory as createEngineDemoFactory,
  createDemoWithVariantsFactory as createEngineDemoWithVariantsFactory,
} from '@fairgarden/docs/abstractCreateDemo'

import type { DemoOptions } from '../../content/demo/DemoContent'
import { DemoLazy } from '../../content/demo/DemoLazy'
import { DemoLoading } from '../../content/demo/DemoLoading'
import { DemoTitle } from './DemoTitle'

/*
 * createDemo: the docs engine's demo factories, pre-wired with the design
 * system's Demo, as fg-docs' own `createDemo`: DemoContent code-split
 * (`DemoLazy`), `DemoLoading` until it loads, `DemoTitle`, and the source
 * links `withDeploymentConfig` sets up. Every option passes through, so an
 * app replaces any of them.
 */

/** The engine's demo factory options (`createDemoFactory` from `@fairgarden/docs/abstractCreateDemo`). */
export type DemoFactoryOptions<T extends {} = DemoOptions> = Parameters<
  typeof createEngineDemoFactory<T>
>[0]

/** What `createDemoFactory` returns: `createDemo(url, component, meta?)`. */
export type CreateDemo<T extends {} = DemoOptions> = ReturnType<typeof createEngineDemoFactory<T>>

/** What `createDemoWithVariantsFactory` returns: `createDemoWithVariants(url, variants, meta?)`. */
export type CreateDemoWithVariants<T extends {} = DemoOptions> = ReturnType<
  typeof createEngineDemoWithVariantsFactory<T>
>

function demoOptions<T extends {}>(
  options: Partial<DemoFactoryOptions<T>>,
  defaults: Partial<DemoFactoryOptions<T>> = {},
): DemoFactoryOptions<T> {
  return {
    DemoContent: DemoLazy as DemoFactoryOptions<T>['DemoContent'],
    DemoContentLoading: DemoLoading as DemoFactoryOptions<T>['DemoContentLoading'],
    DemoTitle,
    // Set by `withDeploymentConfig`: turns file:// source URLs into hosted links.
    projectDir: process.env.SOURCE_CODE_ROOT_DIR,
    projectUrl: process.env.SOURCE_CODE_ROOT_URL,
    // The server HTML carries the highlighted code.
    highlightAfter: 'init',
    ...defaults,
    ...options,
  }
}

/**
 * The engine's `createDemoFactory` with the design system's defaults
 * (`DemoContent: DemoLazy`, `DemoContentLoading: DemoLoading`, `DemoTitle`,
 * `projectDir` / `projectUrl` from `SOURCE_CODE_ROOT_DIR` /
 * `SOURCE_CODE_ROOT_URL`, `highlightAfter: 'init'`); `options` override any.
 */
export function createDemoFactory<T extends {} = DemoOptions>(
  options: Partial<DemoFactoryOptions<T>> = {},
): CreateDemo<T> {
  return createEngineDemoFactory<T>(demoOptions(options))
}

/**
 * As `createDemoFactory`, over the engine's `createDemoWithVariantsFactory`,
 * with `fallbackUsesAllVariants: true`: the loading state gets every
 * variant, so it draws the variant Select (nothing shifts at the swap) and
 * every variant's `#slug` targets.
 */
export function createDemoWithVariantsFactory<T extends {} = DemoOptions>(
  options: Partial<DemoFactoryOptions<T>> = {},
): CreateDemoWithVariants<T> {
  return createEngineDemoWithVariantsFactory<T>(
    demoOptions(options, { fallbackUsesAllVariants: true }),
  )
}

/**
 * Creates a demo: the component rendered above its highlighted source.
 * @param url `import.meta.url` of the demo's `index.ts`.
 * @param component The component to render.
 * @param meta Optional `name`, `slug` and display options.
 */
export const createDemo = /* @__PURE__ */ createDemoFactory()

/**
 * As `createDemo`, with switchable variants of the same demo.
 * @param url `import.meta.url` of the demo's `index.ts`.
 * @param variants The variants, keyed by name (`{ CssModules, Tag }`).
 * @param meta Optional `name`, `slug` and display options.
 */
export const createDemoWithVariants = /* @__PURE__ */ createDemoWithVariantsFactory()

import {
  createMultipleTypesFactory as createEngineMultipleTypesFactory,
  createTypesFactory as createEngineTypesFactory,
  type AbstractCreateTypesOptions,
} from '@fairgarden/docs/abstractCreateTypes'

import { TypePre } from '../../content/types-table/TypePre'
import { TypesTable } from '../../content/types-table/TypesTable'

/*
 * createTypes: the docs engine's types factories, pre-wired with the design
 * system's Types Table and TypePre. Every option passes through. Pass your
 * MDX map as `components` (`createMdxComponents()`) so descriptions render
 * in the same components as your pages; without it they render as plain
 * elements, and this module stays free of the MDX map.
 */

/** The engine's types factory options (`@fairgarden/docs/abstractCreateTypes`). */
export type TypesFactoryOptions = AbstractCreateTypesOptions

/** What `createTypesFactory` returns: `createTypes(url, component, meta?)`. */
export type CreateTypes = ReturnType<typeof createEngineTypesFactory>

/** What `createMultipleTypesFactory` returns: `createMultipleTypes(url, components, meta?)`. */
export type CreateMultipleTypes = ReturnType<typeof createEngineMultipleTypesFactory>

function typesOptions(options: Partial<TypesFactoryOptions>): TypesFactoryOptions {
  return {
    TypesTable: TypesTable as TypesFactoryOptions['TypesTable'],
    TypePre,
    ...options,
  }
}

/** The engine's `createTypesFactory` with `TypesTable` and `TypePre`; `options` override either. */
export function createTypesFactory(options: Partial<TypesFactoryOptions> = {}): CreateTypes {
  return createEngineTypesFactory(typesOptions(options))
}

/** As `createTypesFactory`, over the engine's `createMultipleTypesFactory`. */
export function createMultipleTypesFactory(
  options: Partial<TypesFactoryOptions> = {},
): CreateMultipleTypes {
  return createEngineMultipleTypesFactory(typesOptions(options))
}

/**
 * The API table for one export, extracted from TypeScript at build time.
 * @param url `import.meta.url` of the page's `types.ts`.
 * @param component The export to document.
 */
export const createTypes = /* @__PURE__ */ createTypesFactory()

/** API tables for several related exports, rendered as `<TypesX.Part />`. */
export const createMultipleTypes = /* @__PURE__ */ createMultipleTypesFactory()

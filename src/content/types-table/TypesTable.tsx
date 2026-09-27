'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'
import { useTypes } from '@fairgarden/docs/useTypes'
import type { EnhancedTypesMeta, TypesTableProps as EngineTypesTableProps } from '@fairgarden/docs/useTypes'

import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './types-table.module.css'

/*
 * Types Table: the API reference for an export, as the `@fairgarden/docs`
 * types factories extract it from TypeScript at build time. It fills
 * `createTypesFactory`'s `TypesTable` slot: it calls `useTypes(props)` and
 * renders the result: a component's props, data attributes and CSS
 * variables; a hook's or function's parameters (or expanded options) and
 * return type; a raw type's formatted code; and each additional type in a
 * disclosure. Type signatures render through `TypePre`.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: types-table.module.css; CVA function `typesTable`.
 * - Axes: `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: color axes none [D133].
 * - Color fallback: inherits the scope.
 * - States: an additional type's `details[open]` (the native disclosure);
 *   the summary's `:focus-visible` → the ring.
 * - Parts: base, description, scroll (the table's own horizontal scroll),
 *   table (the frame: rule top and bottom, hairline body rows [D83]), name
 *   (the key column), fallback (the default), returns, label, additional
 *   (an additional type's disclosure), summary.
 * - Scope: none. Container: none.
 *
 * Tables print in full, their rows never split; additional types print
 * open, black on white.
 */
export const typesTable = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

/** Props for TypesTable: what the types factories hand their `TypesTable`, plus the scales. */
export type TypesTableProps = EngineTypesTableProps<{
  /** Primary scale: rules, labels, type inks, focus ring. Never defaulted [D133]. */
  primary?: PrimaryScale
  /** Secondary scale: keyword inks in the signatures. Never defaulted. */
  secondary?: RadixScale
  className?: string
}>

type Row = {
  key: string
  type?: React.ReactNode
  fallback?: React.ReactNode
  description?: React.ReactNode
}

function Rows(props: { head: readonly [string, string, string]; rows: Row[] }) {
  if (props.rows.length === 0) return null
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            {props.head.map((cell) => (
              <th key={cell} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className={styles.name}>
                <code>{row.key}</code>
              </th>
              <td>
                {row.type}
                {row.fallback ? (
                  <div className={styles.fallback}>Default: {row.fallback}</div>
                ) : null}
              </td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TypeDoc({ meta }: { meta: EnhancedTypesMeta }) {
  switch (meta.type) {
    case 'component': {
      const { description, props, dataAttributes, cssVariables } = meta.data
      return (
        <>
          {description ? <div className={styles.description}>{description}</div> : null}
          <Rows
            head={['Prop', 'Type', 'Description']}
            rows={Object.entries(props).map(([key, prop]) => ({
              key,
              type: prop.type,
              fallback: prop.default,
              description: prop.description,
            }))}
          />
          <Rows
            head={['Data attribute', 'Type', 'Description']}
            rows={Object.entries(dataAttributes).map(([key, attr]) => ({
              key,
              type: attr.type,
              description: attr.description,
            }))}
          />
          <Rows
            head={['CSS variable', 'Type', 'Description']}
            rows={Object.entries(cssVariables).map(([key, cssVar]) => ({
              key,
              type: cssVar.type,
              description: cssVar.description,
            }))}
          />
        </>
      )
    }
    case 'hook':
    case 'function': {
      const { description, parameters, expandedProperties, returnValue } = meta.data
      return (
        <>
          {description ? <div className={styles.description}>{description}</div> : null}
          {expandedProperties ? (
            <Rows
              head={['Property', 'Type', 'Description']}
              rows={Object.entries(expandedProperties).map(([key, prop]) => ({
                key,
                type: prop.type,
                fallback: prop.default,
                description: prop.description,
              }))}
            />
          ) : (
            <Rows
              head={['Parameter', 'Type', 'Description']}
              rows={(parameters ?? []).map((param) => ({
                key: param.name,
                type: param.type,
                fallback: param.default,
                description: param.description,
              }))}
            />
          )}
          {returnValue?.kind === 'simple' ? (
            <div className={styles.returns}>
              <span className={styles.label}>Returns</span>
              {returnValue.type}
            </div>
          ) : null}
        </>
      )
    }
    case 'raw':
      return (
        <>
          {meta.data.description ? (
            <div className={styles.description}>{meta.data.description}</div>
          ) : null}
          {meta.data.formattedCode}
        </>
      )
    default:
      return null
  }
}

/**
 * The API reference for one export: the table for the main type, and each
 * additional type (a namespaced `Props`, a global type) in a disclosure,
 * linkable by its slug.
 */
export function TypesTable(props: TypesTableProps) {
  const { primary, secondary, className } = props
  const scope = useScopeAttributes()
  const { type, additionalTypes } = useTypes(props)

  return (
    <div {...scope} className={typesTable({ primary, secondary, className })}>
      {type ? <TypeDoc meta={type} /> : null}
      {additionalTypes.map((meta) => (
        <details key={meta.name} className={styles.additional}>
          <summary className={styles.summary}>{meta.name}</summary>
          <div id={meta.slug}>
            <TypeDoc meta={meta} />
          </div>
        </details>
      ))}
    </div>
  )
}

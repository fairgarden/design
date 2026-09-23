'use client'

import * as React from 'react'
import { useTypes } from '@fairgarden/docs/useTypes'
import type { TypesTableProps, EnhancedTypesMeta } from '@fairgarden/docs/useTypes'
import styles from './TypesTable.module.css'

type Row = { key: string; type?: React.ReactNode; fallback?: React.ReactNode; description?: React.ReactNode }

function Rows(props: { head: [string, string, string]; rows: Row[] }) {
  if (props.rows.length === 0) return null
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            {props.head.map((cell) => (
              <th key={cell}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.key}>
              <td className={styles.name}>
                <code>{row.key}</code>
              </td>
              <td>
                {row.type}
                {row.fallback ? <div className={styles.default}>Default: {row.fallback}</div> : null}
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

/** The API table `createTypes` renders for each documented export. */
export function TypesTable(props: TypesTableProps<{}>) {
  const { type, additionalTypes } = useTypes(props)

  return (
    <div className={styles.root}>
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

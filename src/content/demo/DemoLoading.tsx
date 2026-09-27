'use client'

import * as React from 'react'
import type { ContentLoadingProps } from '@fairgarden/docs/CodeHighlighter/types'

import { isOn, variantItems } from '../code-block/CodeBlockFrame'
import { CodeBlockSectionLoading, fallbackSlugs } from '../code-block/CodeBlockLoading'
import { Select } from '../../forms/select'
import type { PrimaryScale, RadixScale } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import type { DemoOptions } from './DemoContent'
import { demo } from './DemoFrame'
import styles from './demo.module.css'

/*
 * Demo's loading state, for the demo factories' `DemoContentLoading` (as
 * fg-docs' CollapsibleDemoContentLoading): the live component at once, and
 * the engine's precomputed fallback in the embedded code section, in the
 * loaded demo's frame and geometry, so the server HTML carries the code,
 * nothing shifts at the swap, and the `#slug` scroll targets exist before
 * the content loads. Like CodeBlockLoading, it calls only the engine's
 * `useCodeFallback`; nothing from `useDemo`. The variant Select, tabs and
 * actions render disabled until the content swaps in.
 */

/** Props for DemoLoading: what the demo factories hand `DemoContentLoading`, plus the preview hook and scales. */
export type DemoLoadingProps = ContentLoadingProps<DemoOptions> & {
  /**
   * As DemoContent's `renderPreview`, called with the fallback's
   * `component`. Pass the loaded demo's, or a stand-in the same size: a
   * preview that must mount only once (an iframe) renders its stand-in here,
   * since the swap replaces the loading tree.
   */
  renderPreview?: (component: React.ReactNode) => React.ReactNode
  primary?: PrimaryScale
  secondary?: RadixScale
  className?: string
}

/**
 * The loading state of a demo: the component above its precomputed code,
 * with the controls disabled until the content loads.
 */
export function DemoLoading(props: DemoLoadingProps) {
  const { renderPreview, primary, secondary, className, ...fallback } = props
  const scope = useScopeAttributes()
  const items = variantItems(Object.keys(fallback.components ?? {}))

  return (
    <div {...scope} className={demo({ primary, secondary, className })}>
      {fallbackSlugs(fallback, fallback.fileNames ?? []).map((slug) => (
        <span key={slug} id={slug} className={styles.target} />
      ))}
      <div className={styles.frame}>
        {items.length > 1 ? (
          <div className={styles.bar}>
            <Select
              aria-label="Variant"
              items={items}
              value={fallback.initialVariant ?? items[0].value}
              disabled
              primary={primary}
              secondary={secondary}
              className={styles.variantSelect}
            />
          </div>
        ) : null}
        <div className={styles.stage}>
          <div className={styles.preview}>
            {renderPreview ? renderPreview(fallback.component) : fallback.component}
          </div>
        </div>
        <CodeBlockSectionLoading
          fallback={fallback}
          collapsible={isOn(fallback.collapse)}
          embedded
          primary={primary}
          secondary={secondary}
          className={styles.code}
        />
      </div>
    </div>
  )
}

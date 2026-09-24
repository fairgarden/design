'use client'

import * as React from 'react'
import type { ContentProps } from '@fairgarden/docs/CodeHighlighter/types'
import { useCodeWindow } from '@fairgarden/docs/useCodeWindow'
import { useDemo } from '@fairgarden/docs/useDemo'
import { useScrollAnchor } from '@fairgarden/docs/useScrollAnchor'

import type { CodeBlockOptions } from '../code-block/CodeBlock'
import { isOn, variantItems } from '../code-block/CodeBlockFrame'
import {
  CodeBlockSection,
  SWAP_ANCHOR_MS,
  useCodeBlockOptions,
} from '../code-block/CodeBlockSection'
import { useCopyToasts } from '../code-block/CodeBlockToasts'
import { Select } from '../../forms/select'
import type { PrimaryScale, RadixScale } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import { demo } from './DemoFrame'
import styles from './demo.module.css'

/*
 * Demo: a live component above its source. It is the `@fairgarden/docs`
 * DemoContent component, built as fg-docs' DemoContent: pass it to
 * `createDemoFactory({ DemoContent })` or `createDemoWithVariantsFactory`.
 * It calls `useDemo(props)` and renders the selected variant's component in
 * the preview surface (with any runtime error laid across its top edge),
 * the variants in a Select in its corner, and the Code Block's code section
 * embedded beneath. The engine owns the variant, file and transform state,
 * the swap, the hash deep links, the stored preferences and copy.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: demo.module.css; CVA function `demo`.
 * - Axes: `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: color axes none [D133].
 * - Color fallback: inherits the scope, and passes both scales to the
 *   embedded code section and the variant Select.
 * - States: static. The variant Select, the file tabs, the actions and the
 *   window render the engine's state; a variant change updates the Select at
 *   once and the code swaps after --fgd-duration-swap (instant under
 *   --motionNotOK). The error (useDemo's `error`, reported through a
 *   `CodeControllerContext`) is `role="alert"` in the danger roles, no
 *   shadow.
 * - Parts: base (the root: scroll targets, then the frame), target (a hidden
 *   `#slug` scroll target), frame (the one edge), bar (the variant bar),
 *   variantSelect (its Select trigger, in the top-start corner), stage
 *   (holds the error and the surface), error, preview (the surface), code
 *   (the embedded code section's root).
 * - Scope: none. Container: none; inherits its context.
 *
 * The frame never clips: the error hangs across the preview's top edge and
 * the code's actions may hang past the frame's inline end, so each part
 * rounds its own corners to the frame's inner radius. The surface clips its
 * own content without a scroll container, so a sticky demo still docks. The
 * preview prints as rendered (components carry their own print fallbacks),
 * the variant bar as its selected name and the code in full, black on white.
 */
export { demo } from './DemoFrame'

/** Demo's own content props: JSON, so a demo's props (`<DemoX collapse />`) can carry them. */
export type DemoOptions = CodeBlockOptions

/** Props for DemoContent: the content props the demo factories hand over, plus the preview hook and scales. */
export type DemoContentProps = ContentProps<DemoOptions> & {
  /**
   * Wraps or replaces what renders in the preview surface, such as a docs
   * site's iframe of the demo's own page. Called with useDemo's `component`.
   * Default: the component as is. A rendered preview that runs edge to edge
   * cancels the surface's inset with `margin: calc(-1 * var(--demo-inset))`.
   * A function, so pass it from a client component that wraps DemoContent.
   */
  renderPreview?: (component: React.ReactNode) => React.ReactNode
  /** Primary scale: frame, labels, syntax inks, focus ring. Never defaulted [D133]. */
  primary?: PrimaryScale
  /** Secondary scale: keywords, highlight accent, the selected file tab. Never defaulted. */
  secondary?: RadixScale
  className?: string
}

/**
 * A demo: the live component on the page ground, with a Select of the
 * variants in its top-start corner (two or more), above the embedded code
 * with the file tabs, the actions (copy, copy link, view source, TS | JS)
 * and, with `collapse`, the window. Every file's `#slug` has a hidden
 * scroll target before the frame.
 */
export function DemoContent(props: DemoContentProps) {
  const { renderPreview, primary, secondary, className, ...contentProps } = props
  const collapsible = isOn(contentProps.collapse)
  const scope = useScopeAttributes()
  const codeWindow = useCodeWindow<HTMLLabelElement>()
  const toasts = useCopyToasts()
  const demoResult = useDemo(contentProps, useCodeBlockOptions(collapsible, codeWindow, toasts))

  // Variant swaps anchor on the whole demo (the preview and code both reflow),
  // held at the variant bar, as in the source.
  const { containerRef: variantAnchorRef, anchorScroll: anchorVariantScroll } =
    useScrollAnchor<HTMLDivElement>()
  const barRef = React.useRef<HTMLDivElement | null>(null)
  const items = React.useMemo(() => variantItems(demoResult.variants), [demoResult.variants])

  const selectVariant = (value: string) => {
    if (barRef.current) anchorVariantScroll(barRef.current, SWAP_ANCHOR_MS)
    demoResult.selectVariant(value)
  }

  return (
    <div {...scope} className={demo({ primary, secondary, className })}>
      {demoResult.allFilesSlugs.map((file) => (
        <span key={file.slug} id={file.slug} className={styles.target} />
      ))}
      <div ref={variantAnchorRef} className={styles.frame}>
        {items.length > 1 ? (
          <div ref={barRef} className={styles.bar}>
            <Select
              aria-label="Variant"
              items={items}
              value={demoResult.selectedVariant}
              onValueChange={(value) => {
                if (value != null) selectVariant(value)
              }}
              primary={primary}
              secondary={secondary}
              className={styles.variantSelect}
            />
          </div>
        ) : null}
        <div className={styles.stage}>
          {demoResult.error ? (
            <div role="alert" className={styles.error}>
              {demoResult.error}
            </div>
          ) : null}
          <div className={styles.preview}>
            {renderPreview ? renderPreview(demoResult.component) : demoResult.component}
          </div>
        </div>
        <CodeBlockSection
          code={demoResult}
          codeWindow={codeWindow}
          collapsible={collapsible}
          toasts={toasts}
          embedded
          primary={primary}
          secondary={secondary}
          className={styles.code}
        />
      </div>
    </div>
  )
}

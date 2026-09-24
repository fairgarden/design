'use client'

import * as React from 'react'
import type { ContentProps } from '@fairgarden/docs/CodeHighlighter/types'
import { useCode } from '@fairgarden/docs/useCode'
import { useCodeWindow } from '@fairgarden/docs/useCodeWindow'

import type { PrimaryScale, RadixScale } from '../../utils/scales'
import { isOn } from './CodeBlockFrame'
import { CodeBlockSection, useCodeBlockOptions } from './CodeBlockSection'
import { useCopyToasts } from './CodeBlockToasts'

export { codeBlock } from './CodeBlockFrame'

/*
 * Code Block: highlighted source in a frame, with file tabs, variants, the
 * TS | JS switch, copy and a collapsible window for long code. It is a
 * `@fairgarden/docs` Content component, built as fg-docs' CodeContent: pass
 * it as CodeHighlighter's `Content` (the MDX `pre` override, a server `Code`
 * component). It calls `useCode(props)` and renders from the result; the
 * engine owns the highlighting, the variant, file and transform state, the
 * swap, the hash deep links, the stored preferences and copy.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: code-block.module.css; CVA function `codeBlock`.
 * - Axes: `embedded` → embedded (the Demo's code section: no outer frame;
 *   the header joins the part above with a --border-size-1 --role-rule);
 *   `primary`, `secondary` → scales module classes.
 * - Compound variants: none. Defaults: embedded false; color axes: none [D133].
 * - Color fallback: inherits the scope, and passes both scales to FileTabs.
 * - States: `aria-busy` while useCode's `pendingTransform` is set (the
 *   "-ing…" label in the header, no spinner [D84]); `data-collapsible` with
 *   the `collapse` content prop, and the hidden checkbox (controlled by
 *   useCode's `expanded`) `:checked` → expanded (a clip reveal at
 *   --fgd-duration-disclosure, never opacity [D91]); the engine's
 *   `data-transforming` on the `pre` → the line grow and shrink of a swap at
 *   --fgd-duration-swap; `data-scrollbar-gutter` (useCodeWindow) → the
 *   scrollbar's margin swap; everything instant under --motionNotOK. The
 *   header's states (the hanging "More actions" trigger, the scroll line,
 *   the status) are File Tabs'.
 * - Parts: base (the frame), target (a hidden `#slug` scroll target),
 *   variantSelect and transformSwitch (the one-file actions' scroll
 *   anchors), source, pre (useCode's `preClassName`), checkbox, toggle,
 *   toggleLabel. The header is File Tabs (`frame="top"`, or `"joined"`
 *   embedded) with the actions as its `controls` and the busy label as its
 *   `status`. The engine's own hooks (frames, lines,
 *   emphasis, swap bridges, syntax tokens) are styled as global classes
 *   under `pre` and `source`.
 * - Scope: none. Container: none; inherits its context.
 *
 * Syntax colors are role variables, so a block follows its ground and the
 * page mode with no mode-specific rule, and prints black on white. A block
 * never splits across pages and prints expanded, without its controls.
 */

/** Code Block's own content props: JSON, so a fence's `data-content-props` or a demo's props can carry them. */
export type CodeBlockOptions = {
  /**
   * Collapses the code to its window (`@focus`, emphasis) with the "Show all {n} lines" toggle,
   * where the code has one. A fence flag (` ```tsx collapse `) arrives as the string `'true'`,
   * which counts. Not `collapsible`: the engine hands a ContentLoading its own `collapsible`
   * (whether a file has a window), which would shadow it. Default `false`.
   */
  collapse?: boolean | 'true'
}

/** Props for CodeBlock: the content props CodeHighlighter hands its `Content`, plus the block's scales. */
export type CodeBlockProps = ContentProps<CodeBlockOptions> & {
  /** Primary scale: frame, labels, syntax inks, highlight fills, focus ring. Never defaulted [D133]. */
  primary?: PrimaryScale
  /** Secondary scale: highlight accent bar (`--role-accent`), keywords (`--secondary12`), the selected file tab. Never defaulted. */
  secondary?: RadixScale
  className?: string
}

/**
 * A code block: the file tabs (or the one file's name), the busy label and
 * the actions in the header, the selected file's highlighted source, and,
 * with `collapse`, the window's toggle under a long block. Tabs are links
 * to each file's `#slug`; a modifier click opens the link instead of
 * switching. Copy writes the selected file; "Copy link" its deep link. Each
 * copy confirms with a toast (a danger toast if the clipboard refuses)
 * through the design system's ToastProvider, where one is mounted above;
 * without one, copying is silent.
 */
export function CodeBlock(props: CodeBlockProps) {
  const { primary, secondary, className, ...contentProps } = props
  const collapsible = isOn(contentProps.collapse)
  const codeWindow = useCodeWindow<HTMLLabelElement>()
  const toasts = useCopyToasts()
  const code = useCode(contentProps, useCodeBlockOptions(collapsible, codeWindow, toasts))

  return (
    <CodeBlockSection
      code={code}
      codeWindow={codeWindow}
      collapsible={collapsible}
      toasts={toasts}
      primary={primary}
      secondary={secondary}
      className={className}
    />
  )
}

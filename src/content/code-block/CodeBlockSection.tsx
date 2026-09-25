'use client'

import * as React from 'react'
import type { UseCodeOpts, UseCodeResult } from '@fairgarden/docs/useCode'
import type { UseCodeWindowResult } from '@fairgarden/docs/useCodeWindow'
import { useCopier } from '@fairgarden/docs/useCopier'
import { useScrollAnchor } from '@fairgarden/docs/useScrollAnchor'

import type { PrimaryScale, RadixScale } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import { SWAP_DURATION_MS } from '../../utils/tokens'
import { useMediaQuery } from '../../utils/useMediaQuery'
import { CodeActionsMenu } from './CodeActionsMenu'
import { CodeBlockHeader } from './CodeBlockHeader'
import { codeBlock, CodeBlockToggle, variantItems } from './CodeBlockFrame'
import { CopyToaster, type CopyToasts } from './CodeBlockToasts'
import styles from './code-block.module.css'

/*
 * Internal to Code Block and Demo: the code section both render from
 * `useCode`'s (or `useDemo`'s) result, as fg-docs' CodeContent and
 * DemoContent compose CodeBlockHeader, CodeActionsMenu and CodeSource; the
 * header is File Tabs, with CodeActionsMenu as its controls, and copies
 * confirm with toasts (CodeBlockToasts). The engine owns every state here
 * (file, variant, transform, window, hash); this renders it. Not exported
 * from the index.
 */

/** A swap's scroll-anchor window: twice the swap (the source's 700 ms). */
export const SWAP_ANCHOR_MS = 2 * SWAP_DURATION_MS

/**
 * The options Code Block and Demo pass `useCode` / `useDemo`, as fg-docs'
 * CodeContent and CollapsibleCodeContent do: the block's `pre` class, the
 * 350 ms swap (0 under reduced motion, where the CSS is instant too) and,
 * with a window, the `'focus'` layout shifts and keyboard expansion that
 * anchors like a click; and the copy toasts' callbacks.
 */
export function useCodeBlockOptions(
  collapsible: boolean,
  codeWindow: UseCodeWindowResult<HTMLLabelElement>,
  toasts: CopyToasts,
): UseCodeOpts {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const delay = reducedMotion ? 0 : SWAP_DURATION_MS
  const { anchorScroll } = codeWindow
  return React.useMemo<UseCodeOpts>(
    () => ({
      preClassName: styles.pre,
      transformDelay: delay,
      variantSwapDelay: delay,
      transformLayoutShift: collapsible ? 'focus' : undefined,
      variantLayoutShift: collapsible ? 'focus' : undefined,
      onExpand: collapsible ? () => anchorScroll('expand') : undefined,
      copy: toasts.copyOpts,
    }),
    [delay, collapsible, anchorScroll, toasts.copyOpts],
  )
}

export type CodeBlockSectionProps = {
  /** `useCode()`'s result (or `useDemo()`'s). */
  code: UseCodeResult<object>
  /** `useCodeWindow()`'s result: its container and toggle refs go on this section. */
  codeWindow: UseCodeWindowResult<HTMLLabelElement>
  /** Shows the window's toggle where the code has a window (`code[data-collapsible]`). */
  collapsible: boolean
  /** `useCopyToasts()`, whose `copyOpts` went to useCode. */
  toasts: CopyToasts
  /**
   * The Demo's code section: no outer frame, the header joins the preview
   * with a rule, and the Demo renders the scroll targets and the variants.
   */
  embedded?: boolean
  primary?: PrimaryScale
  secondary?: RadixScale
  className?: string
}

/**
 * The code section: the scroll targets, the file tabs (or the one file's
 * name), the busy label and the actions in the header, the selected file's
 * highlighted `<pre>`, and the window's toggle.
 */
export function CodeBlockSection(props: CodeBlockSectionProps) {
  const { code, codeWindow, collapsible, toasts, embedded = false, primary, secondary, className } =
    props
  const scope = useScopeAttributes()
  const checkboxId = `${React.useId()}-expand`

  // One container for the window's session (useCodeWindow) and the swaps' (useScrollAnchor).
  const { containerRef: windowContainerRef, toggleRef, anchorScroll: anchorWindow } = codeWindow
  const { containerRef: swapContainerRef, anchorScroll: anchorSwap } =
    useScrollAnchor<HTMLDivElement>()
  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      windowContainerRef.current = node
      swapContainerRef.current = node
    },
    [windowContainerRef, swapContainerRef],
  )
  const anchor = React.useCallback(
    (element: HTMLElement | null) => {
      if (element) anchorSwap(element, SWAP_ANCHOR_MS)
    },
    [anchorSwap],
  )

  const tabs = React.useMemo(
    () => code.files.filter((file) => file.name).map(({ name, slug }) => ({ id: name, name, slug })),
    [code.files],
  )
  const hasTabs = tabs.length > 1

  // "Copy link": the selected file's deep link, through the engine's copier.
  const slug = code.selectedFileSlug
  const link = React.useCallback(
    () => (slug ? `${location.origin}${location.pathname}#${slug}` : undefined),
    [slug],
  )
  const { copy: copyLink } = useCopier(link, toasts.linkOpts)

  const jsTransform = code.availableTransforms.includes('js')
    ? {
        enabled: code.selectedTransform === 'js',
        onToggle: (enabled: boolean, element: HTMLElement | null) => {
          anchor(element)
          code.selectTransform(enabled ? 'js' : null)
        },
      }
    : undefined

  const variants =
    !embedded && code.variants.length > 1
      ? {
          items: variantItems(code.variants),
          selected: code.selectedVariant,
          onChange: (value: string, element: HTMLElement | null) => {
            anchor(element)
            code.selectVariant(value)
          },
        }
      : undefined

  return (
    <div
      {...scope}
      ref={setRootRef}
      className={codeBlock({ embedded, primary, secondary, className })}
      aria-busy={code.pendingTransform !== undefined ? true : undefined}
      data-collapsible={collapsible ? '' : undefined}
    >
      {embedded
        ? null
        : code.allFilesSlugs.map((file) => (
            <span key={file.slug} id={file.slug} className={styles.target} />
          ))}
      <CopyToaster toasts={toasts} />
      <CodeBlockHeader
        tabs={tabs}
        value={code.selectedFileName}
        onValueChange={code.selectFileName}
        embedded={embedded}
        pending={code.pendingTransform}
        primary={primary}
        secondary={secondary}
        actions={
          <CodeActionsMenu
            inline={!hasTabs}
            fileName={code.selectedFileName}
            onCopy={toasts.track('source', code.copy, code.selectedFileName)}
            onCopyLink={slug ? copyLink : undefined}
            fileUrl={code.selectedFileUrl}
            onCopyMarkdown={hasTabs ? toasts.track('markdown', code.copyMarkdown) : undefined}
            onReset={code.reset}
            jsTransform={jsTransform}
            variants={variants}
          />
        }
      >
        <div className={styles.source}>{code.selectedFile}</div>
      </CodeBlockHeader>
      {collapsible ? (
        // Controlled by the engine's `expanded`, so a keyboard expansion (the
        // caret past the window) opens the frames too, as in the source.
        <CodeBlockToggle
          id={checkboxId}
          lines={code.selectedFileLines}
          checked={code.expanded}
          toggleRef={toggleRef}
          onChange={(expanded) => {
            code.setExpanded(expanded)
            anchorWindow(expanded ? 'expand' : 'collapse')
          }}
        />
      ) : null}
    </div>
  )
}

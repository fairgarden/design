'use client'

import * as React from 'react'
import type { ContentLoadingProps } from '@fairgarden/docs/CodeHighlighter/types'
import { useCodeFallback } from '@fairgarden/docs/CodeHighlighter'
import { generateFileSlug } from '@fairgarden/docs/pipeline/loaderUtils'

import { Button } from '../../actions/button'
import { Icon } from '../../foundations/icon'
import { FileTabsControl } from '../../navigation/file-tabs'
import type { PrimaryScale, RadixScale } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import type { CodeBlockOptions } from './CodeBlock'
import { CodeBlockHeader } from './CodeBlockHeader'
import { codeBlock, CodeBlockToggle, isOn } from './CodeBlockFrame'
import styles from './code-block.module.css'

/*
 * Code Block's loading state, for CodeHighlighter's `ContentLoading` slot
 * (as fg-docs' CollapsibleCodeContentLoading): the engine's precomputed
 * fallback in the loaded block's frame and geometry, so the server HTML
 * carries the code, nothing shifts at the swap, and the `#slug` scroll
 * targets exist before the content loads. It calls only `useCodeFallback`,
 * the hook the engine asks a ContentLoading to call (it decodes the compact
 * fallback and hoists the files' dictionaries); nothing from `useCode`, so
 * the loading path stays light. The controls render disabled until the
 * content swaps in.
 */

/** Props for CodeBlockLoading: what CodeHighlighter hands its `ContentLoading`, plus the block's scales. */
export type CodeBlockLoadingProps = ContentLoadingProps<CodeBlockOptions> & {
  primary?: PrimaryScale
  secondary?: RadixScale
  className?: string
}

export type CodeBlockSectionLoadingProps = {
  /** The ContentLoading props (the fallback). */
  fallback: ContentLoadingProps<object>
  collapsible: boolean
  /** The Demo's code section (the Demo renders the scroll targets). */
  embedded?: boolean
  primary?: PrimaryScale
  secondary?: RadixScale
  className?: string
}

/** Every scroll target the fallback knows: the initial variant's files, and other variants' when it carries them. */
export function fallbackSlugs(fallback: ContentLoadingProps<object>, fileNames: readonly string[]) {
  const mainSlug = fallback.slug ?? ''
  const slugs = new Set<string>()
  for (const name of fileNames) {
    if (name) slugs.add(generateFileSlug(mainSlug, name, fallback.initialVariant ?? 'Default'))
  }
  for (const [variant, data] of Object.entries(fallback.extraVariants ?? {})) {
    for (const name of data.fileNames ?? []) {
      if (name) slugs.add(generateFileSlug(mainSlug, name, variant))
    }
  }
  return [...slugs]
}

/** Internal to Code Block and Demo: the code section from the fallback. Not exported from the index. */
export function CodeBlockSectionLoading(props: CodeBlockSectionLoadingProps) {
  const { fallback, collapsible, embedded = false, primary, secondary, className } = props
  const scope = useScopeAttributes()
  const checkboxId = `${React.useId()}-expand`

  // `code` is the ready `<code>` for the displayed file, with the attributes
  // the loaded `<pre>` carries (`data-collapsible`, line counts, language).
  const { code, collapsed, fileNames: decodedNames, totalLines } = useCodeFallback(fallback)
  const fileNames = decodedNames ?? fallback.fileNames ?? []
  const mainVariant = fallback.initialVariant ?? 'Default'
  const tabs = fileNames
    .filter(Boolean)
    .map((name) => ({ id: name, name, slug: generateFileSlug(fallback.slug ?? '', name, mainVariant) }))
  const hasTabs = tabs.length > 1

  return (
    <div
      {...scope}
      className={codeBlock({ embedded, primary, secondary, className })}
      data-collapsible={collapsible ? '' : undefined}
    >
      {embedded
        ? null
        : fallbackSlugs(fallback, fileNames).map((slug) => (
            <span key={slug} id={slug} className={styles.target} />
          ))}
      <CodeBlockHeader
        tabs={tabs}
        value={fallback.initialFilename ?? tabs[0]?.id}
        disabled
        embedded={embedded}
        pending={undefined}
        primary={primary}
        secondary={secondary}
        actions={
          // The loaded actions' stand-ins, the same size: the menu's trigger, or the copy Button.
          hasTabs ? (
            <FileTabsControl aria-label="More actions" disabled>
              <Icon name="more_horiz" weight="interactive" />
            </FileTabsControl>
          ) : (
            <Button iconOnly size="sm" icon="content_copy" disabled>
              Copy source
            </Button>
          )
        }
      >
        <div className={styles.source}>
          <pre className={styles.pre}>{code}</pre>
        </div>
      </CodeBlockHeader>
      {collapsible ? (
        // The no-JS window: the checkbox's `:checked` drives it. A fallback that
        // carries only the window (`collapsed`) has nothing to expand into yet.
        <CodeBlockToggle
          id={checkboxId}
          lines={totalLines}
          defaultChecked={fallback.initialExpanded === true}
          disabled={collapsed}
        />
      ) : null}
    </div>
  )
}

/**
 * The loading state of a code block: the precomputed fallback in the
 * loaded block's frame, with its tabs and actions disabled until the
 * content loads. Pass it as CodeHighlighter's `ContentLoading`.
 */
export function CodeBlockLoading(props: CodeBlockLoadingProps) {
  const { primary, secondary, className, ...fallback } = props
  return (
    <CodeBlockSectionLoading
      fallback={fallback}
      collapsible={isOn(fallback.collapse)}
      primary={primary}
      secondary={secondary}
      className={className}
    />
  )
}

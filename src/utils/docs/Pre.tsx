import * as React from 'react'
import { CodeHighlighter } from '@fairgarden/docs/CodeHighlighter'
import type { CodeHighlighterProps } from '@fairgarden/docs/CodeHighlighter/types'

import { CodeBlockLazy } from '../../content/code-block/CodeBlockLazy'
import { CodeBlockLoading } from '../../content/code-block/CodeBlockLoading'
import { serverSourceEnhancers } from './serverSourceEnhancers'

/** What the docs pipeline puts on a fenced block's `pre`, plus the slots. */
export type PreProps = {
  'data-name'?: string
  'data-slug'?: string
  'data-precompute'?: string
  'data-content-props'?: string
  /** CodeHighlighter's `Content`. Default: `CodeBlockLazy`. */
  Content?: CodeHighlighterProps<object>['Content']
  /** CodeHighlighter's `ContentLoading`. Default: `CodeBlockLoading`. */
  ContentLoading?: CodeHighlighterProps<object>['ContentLoading']
  /**
   * When the code highlights. Default: the engine's own (`'idle'`: the server
   * HTML carries the plain code, highlighted once the browser is idle). Pass
   * `'init'` only to show server-side highlighting: the HTML then arrives
   * highlighted, at the cost of server work and page weight.
   */
  highlightAfter?: CodeHighlighterProps<object>['highlightAfter']
  /**
   * The source enhancers the server runs on code it parses. Default
   * `serverSourceEnhancers` (the engine's emphasis enhancer, with the
   * options demos get), so the emphasis window is in the server HTML and
   * nothing changes size after hydration [D201]. A fence the build
   * precomputed already carries its window; this covers any code the server
   * still parses. Pass `[]` to run none.
   */
  sourceEnhancers?: CodeHighlighterProps<object>['sourceEnhancers']
}

/**
 * The MDX `pre` override, as fg-docs' own `Pre`: the docs pipeline
 * (`transformHtmlCodeBlock`) replaces every fenced code block with
 * `<pre data-precompute=…>`, which only CodeHighlighter can render. Each
 * renders as a Code Block, code-split, with its loading state until the
 * chunk loads, and its emphasis window in the server HTML. A fence's flags
 * (` ```tsx collapse `) arrive in `data-content-props`.
 */
export function Pre(props: PreProps) {
  const {
    Content = CodeBlockLazy,
    ContentLoading = CodeBlockLoading,
    highlightAfter,
    sourceEnhancers = serverSourceEnhancers,
  } = props

  if (!props['data-precompute']) {
    return (
      <div>
        Expected precompute data. Ensure the transformHtmlCodeBlock rehype plugin is used.
      </div>
    )
  }

  const precompute = JSON.parse(props['data-precompute']) as CodeHighlighterProps<object>['precompute']
  const contentProps = props['data-content-props'] ? JSON.parse(props['data-content-props']) : {}
  // A fence with variants hands the loading state every variant, so it draws
  // the variant Select the loaded block shows and the header keeps its size.
  const multipleVariants = Object.keys(precompute ?? {}).length > 1

  return (
    <CodeHighlighter
      name={props['data-name']}
      slug={props['data-slug']}
      precompute={precompute}
      Content={Content}
      ContentLoading={ContentLoading}
      contentProps={contentProps}
      highlightAfter={highlightAfter}
      sourceEnhancers={sourceEnhancers}
      fallbackUsesAllVariants={multipleVariants || undefined}
    />
  )
}

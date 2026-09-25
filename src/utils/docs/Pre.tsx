import * as React from 'react'
import { CodeHighlighter } from '@fairgarden/docs/CodeHighlighter'
import type { CodeHighlighterProps } from '@fairgarden/docs/CodeHighlighter/types'

import { CodeBlockLazy } from '../../content/code-block/CodeBlockLazy'
import { CodeBlockLoading } from '../../content/code-block/CodeBlockLoading'

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
  /** When the code highlights. Default: `'init'`, so the server HTML carries it. */
  highlightAfter?: CodeHighlighterProps<object>['highlightAfter']
}

/**
 * The MDX `pre` override, as fg-docs' own `Pre`: the docs pipeline
 * (`transformHtmlCodeBlock`) replaces every fenced code block with
 * `<pre data-precompute=…>`, which only CodeHighlighter can render. Each
 * renders as a Code Block, code-split, with its loading state until the
 * chunk loads. A fence's flags (` ```tsx collapse `) arrive in
 * `data-content-props`.
 */
export function Pre(props: PreProps) {
  const {
    Content = CodeBlockLazy,
    ContentLoading = CodeBlockLoading,
    highlightAfter = 'init',
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

  return (
    <CodeHighlighter
      name={props['data-name']}
      slug={props['data-slug']}
      precompute={precompute}
      Content={Content}
      ContentLoading={ContentLoading}
      contentProps={contentProps}
      highlightAfter={highlightAfter}
    />
  )
}

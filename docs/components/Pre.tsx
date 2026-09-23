import * as React from 'react'
import { CodeHighlighter } from '@fairgarden/docs/CodeHighlighter'
import type { CodeHighlighterProps } from '@fairgarden/docs/CodeHighlighter/types'
import { CodeContent } from './CodeContent'

type PreProps = {
  'data-name'?: string
  'data-slug'?: string
  'data-precompute'?: string
  'data-content-props'?: string
}

/**
 * The MDX `pre` override. transformHtmlCodeBlock replaces every fenced code
 * block with `<pre data-precompute=…>`, which only CodeHighlighter can render.
 */
export function Pre(props: PreProps) {
  if (!props['data-precompute']) {
    return (
      <div>
        Expected precompute data. Ensure the transformHtmlCodeBlock rehype plugin is used.
      </div>
    )
  }

  const precompute = JSON.parse(
    props['data-precompute'],
  ) as CodeHighlighterProps<object>['precompute']
  const contentProps = props['data-content-props']
    ? JSON.parse(props['data-content-props'])
    : {}

  return (
    <CodeHighlighter
      name={props['data-name']}
      slug={props['data-slug']}
      precompute={precompute}
      Content={CodeContent}
      contentProps={contentProps}
    />
  )
}

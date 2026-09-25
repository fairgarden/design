'use client'

import * as React from 'react'
import { LazyContent } from '@fairgarden/docs/CoordinatedLazy'

import type { CodeBlockProps } from './CodeBlock'

/**
 * Code Block, code-split: CodeHighlighter's `Content` that loads CodeBlock
 * (`useCode`, the tabs, the menus) in its own chunk, as fg-docs'
 * CodeContentLazy. Pair it with `ContentLoading={CodeBlockLoading}`, which
 * shows while the chunk loads. The import lives in this client module
 * because a function can't cross from a server component as a prop.
 */
export function CodeBlockLazy(props: CodeBlockProps) {
  return (
    <LazyContent<CodeBlockProps>
      content={() => import('./CodeBlock').then((mod) => ({ default: mod.CodeBlock }))}
      props={props}
    />
  )
}

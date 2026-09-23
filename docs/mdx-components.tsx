import type { MDXComponents } from 'mdx/types'
import { Pre } from './components/Pre'
import { PagesIndex } from './components/PagesIndex'
import { A, Blockquote, Code, H1, H2, H3, H4, Hr, Ol, P, Table, Ul } from './components/Prose'

/**
 * `pre` is required: transformHtmlCodeBlock replaces every fenced code block
 * with `<pre data-precompute=…>`, which only CodeHighlighter can render.
 * Exported so createTypes renders JSDoc descriptions with the same map.
 */
export const mdxComponents: MDXComponents = {
  pre: Pre,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  a: A,
  ul: Ul,
  ol: Ol,
  code: Code,
  table: Table,
  blockquote: Blockquote,
  hr: Hr,
  PagesIndex,
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components, ...mdxComponents }
}

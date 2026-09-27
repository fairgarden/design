import NextLink from 'next/link'
import type { MDXComponents } from 'mdx/types'
import { createMdxComponents } from '@fairgarden/design/utils/docs/createMdxComponents'
import { PagesIndex } from './components/PagesIndex'

/**
 * The design system's MDX map, with next/link for internal links and the
 * site's section index. `pre` is required: transformHtmlCodeBlock replaces
 * every fenced code block with `<pre data-precompute=…>`, which only
 * CodeHighlighter can render. Exported so createTypes renders JSDoc
 * descriptions with the same map.
 */
export const mdxComponents: MDXComponents = createMdxComponents({
  Link: NextLink,
  components: { PagesIndex },
})

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components, ...mdxComponents }
}

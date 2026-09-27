import type { SourceEnhancers } from '@fairgarden/docs/CodeHighlighter/types'
import { enhanceCodeEmphasis } from '@fairgarden/docs/pipeline/enhanceCodeEmphasis'

/*
 * serverSourceEnhancers: the source enhancers for code the server parses
 * through CodeHighlighter (inline `code`, a string child, a `Pre`), so its
 * emphasis window is in the server HTML. Size-determining state belongs in
 * the first paint; colours may arrive late [D201].
 */

/**
 * The source enhancers CodeHighlighter runs on the server: the engine's
 * emphasis enhancer (`enhanceCodeEmphasis`) with its default options. Pass
 * it as CodeHighlighter's `sourceEnhancers` wherever a page renders code
 * the build didn't precompute, such as inline `code` or a string child;
 * `Pre` and `createMdxComponents` default to it.
 *
 * On the server it frames the code and records its name on the tree, so
 * the HTML arrives with the emphasis frames and the collapsed window, the
 * loading state paints the same lines as the loaded block, and
 * `CodeProviderLazy`'s own emphasis enhancer, which has the same name,
 * skips the tree instead of windowing it after hydration. Nothing changes
 * size once the page is interactive, and hydration never depends on which
 * side has loaded the lazy enhancer. Highlighting stays at the engine's
 * default `highlightAfter`.
 *
 * The options are the ones demos get from the build and
 * `CodeProviderLazy` loads: the enhancer's defaults, which
 * `withFairGardenDocs` uses when it has no `demoEmphasisOptions`. An app
 * that sets `demoEmphasisOptions` passes
 * `[createEnhanceCodeEmphasis(sameOptions)]` instead, so inline code and
 * demos window alike.
 */
export const serverSourceEnhancers: SourceEnhancers = [enhanceCodeEmphasis]

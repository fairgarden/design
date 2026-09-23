'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { mergeProps } from '@base-ui/react/merge-props'
import { cva, type VariantProps } from 'class-variance-authority'

import { Avatar, type AvatarProps } from '../../feedback/avatar'
import { cx, resolveClassName } from '../../utils/className'
import {
  primaryScaleVariants,
  secondaryScaleVariants,
  type PrimaryScale,
  type RadixScale,
} from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import styles from './quote.module.css'

/*
 * Testimonial & Quote (§12.8): named testimonials, pull quotes, blockquotes
 * and epigraphs. Composed from `figure` > `blockquote` + `figcaption`, with
 * Avatar for the portrait; a pull quote that duplicates body text is an
 * `aside` with `aria-hidden`. Never fabricate or anonymize attributions.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: quote.module.css; CVA function `quote`.
 * - Axes: `kind` → band | framed | pull | block | epigraph; `duplicate`
 *   (pull only) → `duplicate`; `primary`, `secondary` → scales module
 *   classes.
 * - Compound variants: none.
 * - Defaults: none (`kind` is required); duplicate false; color axes: none.
 * - Color fallback: inherits the scope, and passes both props to the Avatar.
 * - States: static; a linked `source` is a Link (§9.3), which owns its
 *   hover, focus and press states.
 * - Parts: base, frame (the framed kind's border, on `base`), mark (the
 *   open-quote glyph, framed only), text, rule (the pull quote's short
 *   rule; the blockquote's left rule is `text`'s border), attribution, name,
 *   role, portrait (Avatar Root, styled by §10.12), source.
 * - Scope: none.
 * - Container: none. The hanging pull quote and the 2-up framed
 *   testimonials are page-grid placements on viewport media
 *   (--lg-n-above), owned by the page template [D163].
 */
export const quote = cva(styles.base, {
  variants: {
    kind: {
      band: styles.band,
      framed: styles.framed,
      pull: styles.pull,
      block: styles.block,
      epigraph: styles.epigraph,
    },
    duplicate: {
      true: styles.duplicate,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    duplicate: false,
  },
})

type QuoteVariants = VariantProps<typeof quote>

/** The five quote builds (§12.8). */
export type QuoteKind = 'band' | 'framed' | 'pull' | 'block' | 'epigraph'

interface QuoteContextValue {
  kind: QuoteKind
  primary: PrimaryScale | undefined
  secondary: RadixScale | undefined
}

const QuoteContext = React.createContext<QuoteContextValue>({
  kind: 'block',
  primary: undefined,
  secondary: undefined,
})
QuoteContext.displayName = 'QuoteContext'

type QuoteKindProps =
  | {
      /** A pull quote: `type-quote` followed by a short rule, no attribution. */
      kind: 'pull'
      /**
       * The pull quote repeats text from the article: it renders as an
       * `aside` hidden from assistive technology and is hidden in print
       * [D174]. Default `false`: a pull quote with unique text is a `figure`
       * and prints.
       */
      duplicate?: boolean
    }
  | {
      /**
       * `band`: a centered testimonial alone on a light or saturated ground.
       * `framed`: a testimonial in a `--border-size-2` outline with a heavy
       * open-quote glyph. `block`: a quoted passage in `type-body` behind a
       * `--ds-stroke-3` left rule. `epigraph`: 1–2 lines of display bold
       * italic at a drawing's corner, with no quote marks.
       */
      kind: Exclude<QuoteKind, 'pull'>
      /** Pull quotes only. */
      duplicate?: never
    }

/** Props for Quote: `figure` props, `render`, the kind (and `duplicate`) and the color axes. */
export type QuoteProps = useRender.ComponentProps<'figure'> &
  QuoteKindProps & {
    /**
     * Primary Radix scale: text, mark, rules, frame and attribution. Never
     * defaulted; omitted, it inherits the scope [D133].
     */
    primary?: QuoteVariants['primary']
    /**
     * Secondary Radix scale: only a linked source's underline
     * (`--role-accent`). Never defaulted.
     */
    secondary?: QuoteVariants['secondary']
  }

/**
 * The quote: a `figure` holding `QuoteText` (the `blockquote`) and, for
 * testimonials, a `QuoteAttribution` (`figcaption`) with `QuoteName`,
 * `QuoteRole`, an optional `QuotePortrait` and an optional `QuoteSource`.
 * Keep band and framed testimonials to 40 words; never put quotes in a
 * carousel.
 */
export function Quote(props: QuoteProps) {
  const {
    render,
    ref,
    className,
    kind,
    duplicate,
    primary,
    secondary,
    children,
    ...rest
  } = props
  const scope = useScopeAttributes()
  const isDuplicate = kind === 'pull' && duplicate === true
  const context = React.useMemo<QuoteContextValue>(
    () => ({ kind, primary: primary ?? undefined, secondary: secondary ?? undefined }),
    [kind, primary, secondary]
  )

  const element = useRender({
    defaultTagName: isDuplicate ? 'aside' : 'figure',
    render,
    ref,
    props: mergeProps<'figure'>(
      {
        ...scope,
        ...(isDuplicate ? { 'aria-hidden': true } : null),
        className: quote({ kind, duplicate: isDuplicate, primary, secondary, className }),
        children: (
          <>
            {kind === 'framed' ? (
              <span className={styles.mark} aria-hidden="true">
                {'“'}
              </span>
            ) : null}
            {children}
          </>
        ),
      },
      rest
    ),
  })

  return <QuoteContext.Provider value={context}>{element}</QuoteContext.Provider>
}

/** Props for QuoteText: `blockquote` props and `render`. */
export type QuoteTextProps = useRender.ComponentProps<'blockquote'>

/**
 * The quoted words, a `blockquote` (pass `cite` for a source URL):
 * `type-quote` for band, framed and pull; `type-body` behind the left rule
 * for block; display bold italic for epigraph. Curly quotes only; pull
 * quotes hang their punctuation. A pull quote closes with its short rule.
 */
export function QuoteText(props: QuoteTextProps) {
  const { render, ref, className, children, ...rest } = props
  const { kind } = React.useContext(QuoteContext)
  return useRender({
    defaultTagName: 'blockquote',
    render,
    ref,
    props: mergeProps<'blockquote'>(
      {
        className: cx(kind === 'block' ? styles.textBody : styles.text, className),
        children: (
          <>
            {children}
            {kind === 'pull' ? <span className={styles.rule} aria-hidden="true" /> : null}
          </>
        ),
      },
      rest
    ),
  })
}

/** Props for QuoteAttribution: `figcaption` props and `render`. */
export type QuoteAttributionProps = useRender.ComponentProps<'figcaption'>

/**
 * Who said it, `--size-px-5` below the quote: `QuotePortrait`, then
 * `QuoteName` over `QuoteRole` (a line break, never a pipe), then an
 * optional `QuoteSource`.
 */
export function QuoteAttribution(props: QuoteAttributionProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'figcaption',
    render,
    ref,
    props: mergeProps<'figcaption'>({ className: cx(styles.attribution, className) }, rest),
  })
}

/** Props for QuoteName: `span` props and `render`. */
export type QuoteNameProps = useRender.ComponentProps<'span'>

/** The person's name: `type-label` caps in `--primary12`, on its own line. */
export function QuoteName(props: QuoteNameProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>({ className: cx(styles.name, className) }, rest),
  })
}

/** Props for QuoteRole: `span` props and `render`. */
export type QuoteRoleProps = useRender.ComponentProps<'span'>

/** Role or affiliation under the name: `type-caption` in `--primary12`. */
export function QuoteRole(props: QuoteRoleProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>({ className: cx(styles.role, className) }, rest),
  })
}

/** Props for QuotePortrait: Avatar props; `size` defaults to `md`. */
export type QuotePortraitProps = AvatarProps

/**
 * The portrait: an Avatar at 40 px (`md`) with its `--role-rule` ring,
 * taking the quote's `primary` and `secondary` unless given its own. Compose
 * `AvatarImage` (empty alt, since the name is adjacent) and
 * `AvatarFallback` inside. Prints grayscale, at most 20 mm.
 */
export function QuotePortrait(props: QuotePortraitProps) {
  const { size = 'md', primary, secondary, className, ...rest } = props
  const context = React.useContext(QuoteContext)
  return (
    <Avatar
      {...rest}
      size={size}
      primary={primary ?? context.primary}
      secondary={secondary ?? context.secondary}
      className={resolveClassName(className, (extra) => cx(styles.portrait, extra))}
    />
  )
}

/** Props for QuoteSource: `cite` props and `render`. */
export type QuoteSourceProps = useRender.ComponentProps<'cite'>

/**
 * The source title in a `cite` (`type-caption`, upright). Link it with a
 * `Link` inside, which owns the `--role-accent` underline and its states.
 */
export function QuoteSource(props: QuoteSourceProps) {
  const { render, ref, className, ...rest } = props
  return useRender({
    defaultTagName: 'cite',
    render,
    ref,
    props: mergeProps<'cite'>({ className: cx(styles.source, className) }, rest),
  })
}


import * as React from 'react'

import { Link as DesignLink } from '../../actions/link'
import { cx } from '../className'
import { Pre, type PreProps } from './Pre'
import styles from './mdx.module.css'

/*
 * createMdxComponents: the MDX component map for a docs site built on
 * `@fairgarden/docs`, in the design system's type roles and components.
 * `pre` is the Code Block, through CodeHighlighter (code-split, with its
 * loading state); headings link to themselves; links are the design
 * system's Link. No framework code: pass your router's link as `Link`.
 */

type ElementProps<T extends keyof React.JSX.IntrinsicElements> = React.ComponentProps<T>

/** A link component for internal hrefs, such as next/link. */
export type MdxLinkComponent = React.ComponentType<{
  href: string
  children?: React.ReactNode
  className?: string
}>

/** Options for createMdxComponents. Every one is optional. */
export type CreateMdxComponentsOptions = {
  /**
   * Renders links to internal paths (`/…`), such as next/link, as the
   * design system's Link's element. Default: a plain `a`.
   */
  Link?: MdxLinkComponent
  /** Renders `img`, such as next/image. Default: the plain element. */
  Image?: React.ElementType<ElementProps<'img'>>
  /** Fenced blocks' CodeHighlighter `Content`. Default: `CodeBlockLazy`. */
  Content?: PreProps['Content']
  /** Fenced blocks' CodeHighlighter `ContentLoading`. Default: `CodeBlockLoading`. */
  ContentLoading?: PreProps['ContentLoading']
  /** When fenced blocks highlight. Default: `'init'`, so the server HTML carries it. */
  highlightAfter?: PreProps['highlightAfter']
  /** More components, or replacements for any of the map's, merged last. */
  components?: Record<string, React.ElementType>
}

/** The map createMdxComponents returns. */
export type MdxComponents = Record<string, React.ElementType>

/** A heading that links to itself when it has an id (rehype-slug gives each one). */
function heading<T extends 'h2' | 'h3' | 'h4'>(Tag: T, className: string) {
  function Heading({ className: extra, id, children, ...props }: ElementProps<T>) {
    const Element = Tag as React.ElementType
    return (
      <Element {...props} id={id} className={cx(className, extra)}>
        {id ? (
          <a href={`#${id}`} className={styles.anchor}>
            {children}
          </a>
        ) : (
          children
        )}
      </Element>
    )
  }
  Heading.displayName = `Mdx${Tag.toUpperCase()}`
  return Heading
}

/**
 * The MDX component map: `pre` (the Code Block, through CodeHighlighter),
 * `code` (inline code in the syntax tiers), `h1`–`h4` (h2–h4 link to
 * themselves), `p`, `a` (the design system's Link), `ul`, `ol`, `table`,
 * `blockquote`, `hr`, and `img` when an `Image` is given. Use it as the
 * return of your `useMDXComponents`, and as the types factories'
 * `components`.
 */
export function createMdxComponents(options: CreateMdxComponentsOptions = {}): MdxComponents {
  const { Link, Image, Content, ContentLoading, highlightAfter, components } = options

  function MdxPre(props: PreProps) {
    return (
      <Pre
        Content={Content}
        ContentLoading={ContentLoading}
        highlightAfter={highlightAfter}
        {...props}
      />
    )
  }

  /**
   * Links in running text are the design system's inline Link. Internal
   * links render through `Link` when given; absolute URLs get the external
   * mark.
   */
  function MdxA({ href = '', children, id }: ElementProps<'a'>) {
    if (href.startsWith('/') && Link) {
      return (
        <DesignLink id={id} render={<Link href={href} />}>
          {children}
        </DesignLink>
      )
    }
    return (
      <DesignLink id={id} href={href} external={/^https?:\/\//.test(href) || undefined}>
        {children}
      </DesignLink>
    )
  }

  const map: MdxComponents = {
    pre: MdxPre,
    code: ({ className, ...props }: ElementProps<'code'>) => (
      <code {...props} className={cx(styles.code, className)} />
    ),
    h1: ({ className, ...props }: ElementProps<'h1'>) => (
      <h1 {...props} className={cx(styles.h1, className)} />
    ),
    h2: heading('h2', styles.h2),
    h3: heading('h3', styles.h3),
    h4: heading('h4', styles.h4),
    p: ({ className, ...props }: ElementProps<'p'>) => (
      <p {...props} className={cx(styles.p, className)} />
    ),
    a: MdxA,
    ul: ({ className, ...props }: ElementProps<'ul'>) => (
      <ul {...props} className={cx(styles.list, className)} />
    ),
    ol: ({ className, ...props }: ElementProps<'ol'>) => (
      <ol {...props} className={cx(styles.list, className)} />
    ),
    table: ({ className, ...props }: ElementProps<'table'>) => (
      <div className={styles.tableWrap}>
        <table {...props} className={cx(styles.table, className)} />
      </div>
    ),
    blockquote: ({ className, ...props }: ElementProps<'blockquote'>) => (
      <blockquote {...props} className={cx(styles.blockquote, className)} />
    ),
    hr: ({ className, ...props }: ElementProps<'hr'>) => (
      <hr {...props} className={cx(styles.hr, className)} />
    ),
  }
  if (Image) map.img = Image

  return { ...map, ...components }
}

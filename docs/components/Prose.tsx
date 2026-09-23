import * as React from 'react'
import Link from 'next/link'
import { Link as DesignLink } from '@fairgarden-private/design/components/Link'
import styles from './prose.module.css'

type Props<T extends keyof React.JSX.IntrinsicElements> = React.ComponentProps<T>

const join = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ')

export const H1 = ({ className, ...props }: Props<'h1'>) => (
  <h1 {...props} className={join(styles.h1, className)} />
)
export const H2 = ({ className, ...props }: Props<'h2'>) => (
  <h2 {...props} className={join(styles.h2, className)} />
)
export const H3 = ({ className, ...props }: Props<'h3'>) => (
  <h3 {...props} className={join(styles.h3, className)} />
)
export const H4 = ({ className, ...props }: Props<'h4'>) => (
  <h4 {...props} className={join(styles.h4, className)} />
)
export const P = ({ className, ...props }: Props<'p'>) => (
  <p {...props} className={join(styles.p, className)} />
)
export const Ul = ({ className, ...props }: Props<'ul'>) => (
  <ul {...props} className={join(styles.list, className)} />
)
export const Ol = ({ className, ...props }: Props<'ol'>) => (
  <ol {...props} className={join(styles.list, className)} />
)
export const Code = ({ className, ...props }: Props<'code'>) => (
  <code {...props} className={join(styles.code, className)} />
)
export const Blockquote = ({ className, ...props }: Props<'blockquote'>) => (
  <blockquote {...props} className={join(styles.blockquote, className)} />
)
export const Hr = (props: Props<'hr'>) => <hr {...props} className={styles.hr} />

export const Table = ({ className, ...props }: Props<'table'>) => (
  <div className={styles.tableWrap}>
    <table {...props} className={join(styles.table, className)} />
  </div>
)

/**
 * Links in running text are the design system's own inline Link. Internal
 * links render through next/link for client navigation; absolute URLs get the
 * external mark.
 */
export const A = ({ href = '', children, id }: Props<'a'>) =>
  href.startsWith('/') ? (
    <DesignLink id={id} render={<Link href={href} />}>
      {children}
    </DesignLink>
  ) : (
    <DesignLink id={id} href={href} external={/^https?:\/\//.test(href) || undefined}>
      {children}
    </DesignLink>
  )

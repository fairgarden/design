import * as React from 'react'

import { cx } from '../../utils/className'
import styles from './types-table.module.css'

/** Props for TypePre: a `pre` element's props. */
export type TypePreProps = React.ComponentPropsWithRef<'pre'>

/**
 * A type signature in a Types Table: the types factories' `TypePre` slot.
 * Signatures aren't precomputed like code blocks, so they render unframed,
 * inline in their cell, in the Code Block's syntax tiers, wrapping rather
 * than running past a narrow viewport.
 */
export function TypePre({ className, ...props }: TypePreProps) {
  return <pre {...props} className={cx(styles.typePre, className)} />
}

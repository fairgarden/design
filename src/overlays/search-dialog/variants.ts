import { cva, type VariantProps } from 'class-variance-authority'
import type { SearchResult } from '@fairgarden/docs/useSearch/types'

import type { IconName } from '../../foundations/icon'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import styles from './search-dialog.module.css'

/*
 * The search dialog's shared pieces: the CVA function and the row icons.
 * A plain module (not a client one), so a server component reads them too.
 */

/**
 * On both roots: the trigger (the page scope) and the popup (the overlay
 * scope). Axes: `primary`, `secondary` → scales module classes, never
 * defaulted [D133].
 */
export const searchDialog = cva(styles.base, {
  variants: {
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

/** The color axes of `searchDialog`. */
export type SearchDialogVariants = VariantProps<typeof searchDialog>

/**
 * Row icons by the engine's result `type`: page `description`, part
 * `widgets`, export `deployed_code`, section `format_h2`, subsection
 * `format_h3`.
 */
export const searchDialogTypeIcons = {
  page: 'description',
  part: 'widgets',
  export: 'deployed_code',
  section: 'format_h2',
  subsection: 'format_h3',
} as const satisfies Readonly<Record<SearchResult['type'], IconName>>

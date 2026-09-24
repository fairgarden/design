import { cva } from 'class-variance-authority'

import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import styles from './demo.module.css'

/*
 * Internal to Demo: the CVA function the loaded demo and its loading state
 * share, in a module with no docs engine runtime, so the loading path stays
 * light. Re-exported by DemoContent.
 */

/** Demo's CVA function. */
export const demo = cva(styles.base, {
  variants: {
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
})

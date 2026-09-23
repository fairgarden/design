import { Ground } from '@fairgarden/design/foundations/ground'
import patterns from '@fairgarden/design/utils/pattern.module.css'
import styles from './fringe.module.css'

/**
 * The hatched fringe: jittered 1.5 px ticks hanging from the night band's
 * top edge, in its --primary12. A shaped edge sits only on a seam that tone
 * separates, so it shows in light mode only; in dark mode, print and forced
 * colors the band draws its straight seam rule instead [D179].
 */
export function PatternFringe() {
  return (
    <div className={styles.stack}>
      <Ground preset="paper" className={styles.band}>
        <p className={styles.body}>The page band above the seam.</p>
      </Ground>
      <Ground preset="night" className={`${styles.band} ${patterns.ornamentFringe}`}>
        <p className={styles.display}>Field Notes</p>
      </Ground>
    </div>
  )
}

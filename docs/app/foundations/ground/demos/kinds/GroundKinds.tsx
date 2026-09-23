import { Ground } from '@fairgarden/design/foundations/ground'
import { Link } from '@fairgarden/design/actions/link'
import styles from './kinds.module.css'

/**
 * The three kinds on one page. A `tide` band holds a white face, which
 * follows the mode with the page and draws a --primary10 edge, and tide's
 * companion field, royal, whose white face is a light island with a
 * --primary12 edge in both modes. The night band, for the footer and the
 * media hero only, draws its --primary12 seam in dark mode.
 */
export function GroundKinds() {
  return (
    <div className={styles.stack}>
      <Ground kind="band" preset="tide" className={styles.band}>
        <p className={styles.head}>Band: tide</p>
        <div className={styles.row}>
          <Ground kind="face" preset="white" className={styles.face}>
            <p className={styles.label}>Face on the page ground</p>
            <Link href="#kinds">Field notes</Link>
          </Ground>
          <Ground kind="field" preset="royal" className={styles.field}>
            <p className={styles.label}>Field: royal, tide&apos;s companion</p>
            <Ground kind="face" preset="white" className={styles.face}>
              <p className={styles.label}>Light island</p>
              <Link href="#kinds">Field notes</Link>
            </Ground>
          </Ground>
        </div>
      </Ground>
      <Ground kind="band" preset="night" className={styles.band}>
        <p className={styles.head}>Band: night</p>
        <Link href="#kinds">Footer and media hero only</Link>
      </Ground>
    </div>
  )
}

import { Ground } from '@fairgarden-private/design/components/Ground'
import { SectionDivider } from '@fairgarden-private/design/components/SectionDivider'
import styles from './hill.module.css'

/**
 * The night media hero, then the paper band with the hill as its first
 * child. Switch the page to dark mode: the curve drops for the night band's
 * straight --primary12 seam.
 */
export function SectionDividerHill() {
  return (
    <div className={styles.page}>
      <Ground kind="band" preset="night" className={styles.night}>
        <div className={styles.container}>
          <p className={styles.head}>Night: the media hero</p>
          <p className={styles.text}>At least --size-px-10 of empty ground above the hill.</p>
        </div>
      </Ground>
      <Ground kind="band" preset="paper" className={styles.band}>
        <SectionDivider kind="hill" />
        <div className={styles.container}>
          <p className={styles.head}>Paper rises into it</p>
          <p className={styles.text}>The curve is 4.6% of the width, clamped 12–64 px.</p>
        </div>
      </Ground>
    </div>
  )
}

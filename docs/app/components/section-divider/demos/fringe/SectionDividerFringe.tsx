import { Ground } from '@fairgarden-private/design/components/Ground'
import { SectionDivider } from '@fairgarden-private/design/components/SectionDivider'
import styles from './fringe.module.css'

/**
 * The fringe on the night footer's top edge, in the night band's ink. A page
 * carries one shaped edge; this demo shows the footer placement alone.
 */
export function SectionDividerFringe() {
  return (
    <div className={styles.page}>
      <Ground kind="band" preset="paper" className={styles.band}>
        <div className={styles.container}>
          <p className={styles.head}>Paper</p>
          <p className={styles.text}>The last page-ground band before the footer.</p>
        </div>
      </Ground>
      <Ground kind="band" preset="night" render={<footer />} className={styles.band}>
        <SectionDivider kind="fringe" />
        <div className={styles.container}>
          <p className={styles.head}>Night: the footer</p>
          <p className={styles.text}>Ticks hang from its top edge in light mode only.</p>
        </div>
      </Ground>
    </div>
  )
}

import { Button } from '@fairgarden/design/actions/button'
import { Ground } from '@fairgarden/design/foundations/ground'
import patterns from '@fairgarden/design/utils/pattern.module.css'
import styles from './speckle.module.css'

/**
 * The speckle: jittered dots and seed flecks in --role-tint, one mark per
 * 16 px cell. One full-bleed band or one field per page; on a solid field
 * it is tone-on-tone [D177].
 */
export function PatternSpeckle() {
  return (
    <div className={styles.stack}>
      <Ground preset="paper" className={`${styles.band} ${patterns.patternSpeckle}`}>
        <p className={styles.display}>Land for good</p>
        <Button variant="solid">Our Mission</Button>
      </Ground>
      <Ground kind="field" preset="leaf" className={`${styles.band} ${patterns.patternSpeckle}`}>
        <p className={styles.display}>Land for good</p>
        <Button variant="solid">Our Mission</Button>
      </Ground>
    </div>
  )
}

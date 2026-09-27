import { Button } from '@fairgarden/design/actions/button'
import { Ground } from '@fairgarden/design/foundations/ground'
import patterns from '@fairgarden/design/utils/pattern.module.css'
import styles from './awning.module.css'

/**
 * The awning: 24 px stripes of the ground and --role-tint, starting at the
 * content edge. One per page, carrying display type and one action; on a
 * campaign field it is tone-on-tone [D177].
 */
export function PatternAwning() {
  return (
    <div className={styles.stack}>
      <Ground preset="paper" className={`${styles.band} ${patterns.patternAwning}`}>
        <p className={styles.display}>Summer Market</p>
        <Button variant="solid">Get Tickets</Button>
      </Ground>
      <Ground kind="field" preset="clay" className={`${styles.band} ${patterns.patternAwning}`}>
        <p className={styles.display}>Summer Market</p>
        <Button variant="solid">Get Tickets</Button>
      </Ground>
    </div>
  )
}

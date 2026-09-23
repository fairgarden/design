import { Button } from '@fairgarden/design/actions/button'
import { Ground } from '@fairgarden/design/foundations/ground'
import patterns from '@fairgarden/design/utils/pattern.module.css'
import styles from './sunburst.module.css'

/**
 * The sunburst: dotted rays from the band's bottom centre, clipped by its
 * bottom edge, behind the page's one CTA (CTABlock draws it by default).
 */
export function PatternSunburst() {
  return (
    <Ground preset="white" className={`${styles.band} ${patterns.patternSunburst}`}>
      <p className={styles.display}>Find a land trust near you</p>
      <Button variant="solid" size="lg" icon="arrow_forward">
        Find a Land Trust
      </Button>
    </Ground>
  )
}

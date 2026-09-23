import { Button } from '@fairgarden-private/design/components/Button'
import { Ground } from '@fairgarden-private/design/components/Ground'
import patterns from '@fairgarden-private/design/utils/pattern.module.css'
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

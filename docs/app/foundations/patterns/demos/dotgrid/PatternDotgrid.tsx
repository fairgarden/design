import { Button } from '@fairgarden/design/actions/button'
import { Ground } from '@fairgarden/design/foundations/ground'
import { PresetGround } from '@/components/PresetGround'
import patterns from '@fairgarden/design/utils/pattern.module.css'
import styles from './dotgrid.module.css'

const presets = ['paper', 'forest', 'amber'] as const

/**
 * The dot grid in --role-tint on a light ground and as the dot field on the
 * forest and amber fields [D177]: display type and one action on the dots,
 * any other text on a solid plate (a paper face, a light island inside a
 * field). On a white figure plate the dots take --role-hairline
 * (patternPlate).
 */
export function PatternDotgrid() {
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        {presets.map((preset) => (
          <PresetGround
            key={preset}
            preset={preset}
            className={`${styles.field} ${patterns.patternDotgrid}`}
          >
            <p className={styles.display}>Field Notes</p>
            <Button variant="solid" size="sm">
              Explore
            </Button>
            <Ground preset="paper" kind="face" className={styles.plate}>
              {preset}
            </Ground>
          </PresetGround>
        ))}
      </div>
      <Ground
        preset="white"
        kind="face"
        render={<figure />}
        className={`${styles.figure} ${patterns.patternDotgrid} ${patterns.patternPlate}`}
      >
        <figcaption className={styles.plate}>Figure 1. A specimen plate on the hairline grid.</figcaption>
      </Ground>
    </div>
  )
}

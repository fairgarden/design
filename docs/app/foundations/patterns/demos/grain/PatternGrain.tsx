import { PresetGround } from '@/components/PresetGround'
import patterns from '@fairgarden/design/utils/pattern.module.css'
import styles from './grain.module.css'

const presets = ['forest', 'night', 'leaf', 'amber', 'clay', 'pink', 'royal', 'brick'] as const

/**
 * Grain, the stipple: light and dark flecks from the scope's grain roles,
 * on the fields and the night band [D177]. Pink shows light flecks only and
 * royal dark flecks only; --primary12 text holds 4.5:1 over every fleck.
 */
export function PatternGrain() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround
          key={preset}
          preset={preset}
          className={`${styles.face} ${patterns.patternGrain}`}
        >
          <p className={styles.head}>Join the Count</p>
          <p className={styles.body}>
            {preset === 'night' ? 'The night band.' : `A ${preset} field.`}
          </p>
        </PresetGround>
      ))}
    </div>
  )
}

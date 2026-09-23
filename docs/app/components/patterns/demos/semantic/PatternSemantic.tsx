import patterns from '@fairgarden-private/design/utils/pattern.module.css'
import styles from './semantic.module.css'

const fills = [
  { className: patterns.patternHatch, name: 'patternHatch', note: '45°; series 2' },
  { className: patterns.patternHatch0, name: 'patternHatch0', note: '0°; series 4' },
  {
    className: `${patterns.patternHatchCrossed} ${patterns.patternInkSecondary}`,
    name: 'patternHatchCrossed',
    note: 'Crossed, secondary ink; series 5',
  },
  { className: patterns.patternHatch135, name: 'patternHatch135', note: '135°; projected or partial' },
  { className: patterns.patternDotscreen, name: 'patternDotscreen', note: '1.25 px at 6 px' },
  {
    className: `${patterns.patternDotscreenPitch2} ${patterns.patternInkSecondary}`,
    name: 'patternDotscreenPitch2',
    note: '1.25 px at 5 px, secondary ink; series 3',
  },
  { className: patterns.patternDotscreenPitch3, name: 'patternDotscreenPitch3', note: '1.25 px at 4 px' },
  { className: patterns.patternDotscreenHeavy, name: 'patternDotscreenHeavy', note: '2 px at 4 px' },
]

/**
 * Semantic fills as legend swatches: each has a 1 px --primary12 outline
 * and prints black through print-color-adjust: exact. Charts draw the same
 * geometry as SVG patterns in their own defs.
 */
export function PatternSemantic() {
  return (
    <ul className={styles.legend}>
      {fills.map(({ className, name, note }) => (
        <li key={name} className={styles.item}>
          <span className={`${styles.swatch} ${className}`} aria-hidden="true" />
          <span className={styles.text}>
            <code className={styles.name}>{name}</code>
            <span className={styles.note}>{note}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

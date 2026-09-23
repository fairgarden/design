import { Separator } from '@fairgarden-private/design/components/Separator'
import styles from './variants.module.css'

const variants = ['rule', 'hairline', 'dotted', 'doubleHair', 'ruleDot'] as const

export function SeparatorVariants() {
  return (
    <div className={styles.stack}>
      {variants.map((variant) => (
        <div key={variant} className={styles.row}>
          <code className={styles.name}>{variant}</code>
          <Separator variant={variant} />
        </div>
      ))}
      <div className={styles.inline}>
        <span>Trails</span>
        <Separator orientation="vertical" variant="hairline" />
        <span>Maps</span>
        <Separator orientation="vertical" variant="hairline" />
        <span>Events</span>
      </div>
    </div>
  )
}

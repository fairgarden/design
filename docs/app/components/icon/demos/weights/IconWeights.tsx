import { Icon } from '@fairgarden-private/design/components/Icon'
import { iconTierWeights } from '@fairgarden-private/design/icons/paths'
import styles from './weights.module.css'

const tiers = [
  { size: 'inline', px: 16 },
  { size: 'tag', px: 20 },
  { size: 'block', px: 36 },
] as const

/** Each tier at rest and at emphasis: the stroke steps up one tier, the size never changes. */
export function IconWeights() {
  return (
    <div className={styles.grid}>
      <span className={styles.head}>Tier</span>
      <span className={styles.head}>Rest</span>
      <span className={styles.head}>Emphasis</span>
      {tiers.map(({ size, px }) => (
        <div key={size} className={styles.row}>
          <code className={styles.name}>
            {size} {px} px
          </code>
          <span className={styles.sample}>
            <Icon name="search" size={size} />
            <Icon name="close" size={size} />
            <code className={styles.weight}>{iconTierWeights[size].rest}</code>
          </span>
          <span className={styles.sample}>
            <Icon name="search" size={size} weight="emphasis" />
            <Icon name="close" size={size} weight="emphasis" />
            <code className={styles.weight}>{iconTierWeights[size].emphasis}</code>
          </span>
        </div>
      ))}
    </div>
  )
}

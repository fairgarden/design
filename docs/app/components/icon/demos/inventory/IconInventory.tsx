import { Icon } from '@fairgarden-private/design/components/Icon'
import { iconNames } from '@fairgarden-private/design/icons/paths'
import styles from './inventory.module.css'

export function IconInventory() {
  return (
    <ul className={styles.grid}>
      {iconNames.map((name) => (
        <li key={name} className={styles.cell}>
          <Icon name={name} size="tag" />
          <code className={styles.name}>{name}</code>
        </li>
      ))}
    </ul>
  )
}

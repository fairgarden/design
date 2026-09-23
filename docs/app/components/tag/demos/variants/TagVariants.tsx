import { Tag } from '@fairgarden-private/design/components/Tag'
import { park, waterDrop } from '../subjects'
import styles from './variants.module.css'

/** A topic tag is an icon plus a caps label, with no container; `href` links it to its topic. */
export function TagVariants() {
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Tag icon={park}>Land protection</Tag>
        <Tag icon={waterDrop}>Clean water</Tag>
        <Tag>No icon</Tag>
      </div>
      <div className={styles.row}>
        <Tag icon={park} href="#land">
          Land protection
        </Tag>
        <Tag icon={waterDrop} href="#water">
          Clean water
        </Tag>
      </div>
    </div>
  )
}

import { Tag } from '@fairgarden-private/design/components/Tag'
import { park, waterDrop } from '../subjects'
import styles from './color.module.css'

/** `secondary` is the taxonomy scale and colors the icon only; `primary` inks the label. */
export function TagColor() {
  return (
    <div className={styles.row}>
      <Tag icon={park}>Scope accent</Tag>
      <Tag icon={waterDrop} secondary="indigo">
        Indigo taxonomy
      </Tag>
      <Tag icon={park} secondary="orange">
        Orange taxonomy
      </Tag>
      <Tag icon={park} primary="plum">
        Primary plum
      </Tag>
    </div>
  )
}

import { Badge } from '@fairgarden-private/design/components/Badge'
import styles from './variants.module.css'

/** Labels are authored in sentence case; badges set the caps. */
export function BadgeVariants() {
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Badge>Members</Badge>
        <Badge variant="solid">New</Badge>
        <Badge variant="static">Members only</Badge>
        <Badge variant="sticker">Est. 1998</Badge>
      </div>
      <div className={styles.row}>
        <Badge status="info">Guided</Badge>
        <Badge status="success">Open</Badge>
        <Badge status="warning">Muddy</Badge>
        <Badge status="danger">Closed</Badge>
      </div>
      <div className={styles.row}>
        <Badge numeric>3</Badge>
        <Badge numeric>12</Badge>
        <Badge numeric>128</Badge>
      </div>
    </div>
  )
}

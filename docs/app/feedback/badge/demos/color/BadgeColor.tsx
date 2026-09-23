import { Badge } from '@fairgarden/design/feedback/badge'
import styles from './color.module.css'

/**
 * `secondary` is the pill's fill (an accent or taxonomy scale). Scales with
 * no step-9 text ink, such as red, take the static fill. `primary` inks the
 * outline, sticker and count; `status` computes its own secondary.
 */
export function BadgeColor() {
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Badge variant="solid">Scope accent</Badge>
        <Badge variant="solid" secondary="amber">
          Amber
        </Badge>
        <Badge variant="solid" secondary="indigo">
          Indigo
        </Badge>
        <Badge variant="solid" secondary="orange">
          Orange
        </Badge>
        <Badge variant="solid" secondary="red">
          Red, static fill
        </Badge>
      </div>
      <div className={styles.row}>
        <Badge primary="plum">Primary plum</Badge>
        <Badge variant="sticker" primary="bronze">
          Bronze sticker
        </Badge>
        <Badge numeric primary="slate">
          7
        </Badge>
        <Badge status="warning" secondary="orange">
          Status override
        </Badge>
      </div>
    </div>
  )
}

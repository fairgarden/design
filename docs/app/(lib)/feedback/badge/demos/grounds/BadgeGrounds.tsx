import { Badge } from '@fairgarden/design/feedback/badge'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/**
 * On paper the status badge takes its soft fill; on forest it takes the
 * outline form. The sticker stays a light face on both.
 */
export function BadgeGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <div className={styles.badges}>
            <Badge>Members</Badge>
            <Badge variant="solid" secondary="amber">
              New
            </Badge>
            <Badge variant="sticker">Est. 1998</Badge>
            <Badge status="success">Open</Badge>
            <Badge status="danger">Closed</Badge>
            <Badge numeric>4</Badge>
          </div>
        </PresetGround>
      ))}
    </div>
  )
}

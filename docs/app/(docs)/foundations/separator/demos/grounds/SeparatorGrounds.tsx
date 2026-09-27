import { PresetGround } from '@/components/PresetGround'
import { Separator } from '@fairgarden/design/foundations/separator'
import styles from './grounds.module.css'

const presets = ['paper', 'forest', 'leaf'] as const

export function SeparatorGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <span className={styles.name}>{preset}</span>
          <Separator />
          <Separator variant="hairline" />
          <Separator variant="ruleDot" />
        </PresetGround>
      ))}
    </div>
  )
}

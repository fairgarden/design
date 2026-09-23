import { PresetGround } from '@/components/PresetGround'
import { Icon } from '@fairgarden/design/foundations/icon'
import styles from './grounds.module.css'

const presets = ['paper', 'forest', 'leaf'] as const

/** No color props: the icon is filled in currentColor, so it takes the ink around it. */
export function IconGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <Icon name="check" size="block" label="Checked" />
          <span className={styles.name}>{preset}</span>
        </PresetGround>
      ))}
    </div>
  )
}

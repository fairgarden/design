import { Alert } from '@fairgarden-private/design/components/Alert'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest', 'leaf'] as const

/** On forest and leaf the status marks resolve to the ground's ink. */
export function AlertGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <Alert status="warning" title="High water.">
            Fords may flood on {preset}.
          </Alert>
        </PresetGround>
      ))}
    </div>
  )
}

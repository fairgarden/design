import { Button } from '@fairgarden/design/actions/button'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest', 'leaf'] as const

/** Same props, three grounds: the action becomes the ink pill on leaf. */
export function ButtonGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <span className={styles.name}>{preset}</span>
          <div className={styles.actions}>
            <Button variant="solid">Join Us</Button>
            <Button variant="outline">Visit</Button>
          </div>
        </PresetGround>
      ))}
    </div>
  )
}

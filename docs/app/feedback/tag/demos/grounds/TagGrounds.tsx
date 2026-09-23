import { Tag } from '@fairgarden/design/feedback/tag'
import { PresetGround } from '@/components/PresetGround'
import { park, waterDrop } from '../subjects'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** The icon takes the ground's accent; the label stays the text ink. */
export function TagGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Tag icon={park}>Land protection</Tag>
          <Tag icon={waterDrop} href="#water">
            Clean water
          </Tag>
        </PresetGround>
      ))}
    </div>
  )
}

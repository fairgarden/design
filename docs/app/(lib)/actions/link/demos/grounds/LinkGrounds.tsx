import { PresetGround } from '@/components/PresetGround'
import { Link } from '@fairgarden/design/actions/link'
import styles from './grounds.module.css'

const presets = ['paper', 'forest', 'leaf'] as const

export function LinkGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.text}>
            On {preset}, <Link href="#grounds">find a preserve</Link> near you.
          </p>
          <Link kind="standalone" href="#grounds">
            See all preserves
          </Link>
        </PresetGround>
      ))}
    </div>
  )
}

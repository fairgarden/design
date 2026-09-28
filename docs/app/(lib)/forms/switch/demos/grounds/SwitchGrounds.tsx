import { Switch } from '@fairgarden/design/forms/switch'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** On is green on paper and the inverse pair on forest; position, thumb shape and edge weight carry it on both. */
export function SwitchGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <span className={styles.name}>{preset}</span>
          <div>
            <Switch defaultChecked>Map Labels</Switch>
            <Switch>Contour Lines</Switch>
            <Switch disabled>Satellite View</Switch>
          </div>
        </PresetGround>
      ))}
    </div>
  )
}

import { Slider } from '@fairgarden/design/forms/slider'
import styles from './color.module.css'

/** `primary` drives every part; `secondary` is unused, since the indicator is structure, not a selection. */
export function SliderColor() {
  return (
    <div className={styles.grid}>
      <Slider label="Scope Colors" defaultValue={40} />
      <Slider label="Primary Plum" primary="plum" defaultValue={60} />
      <Slider label="Primary Indigo" primary="indigo" defaultValue={80} />
    </div>
  )
}

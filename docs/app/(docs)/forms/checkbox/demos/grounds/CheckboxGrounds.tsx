import { Checkbox } from '@fairgarden/design/forms/checkbox'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/**
 * Same props on two grounds: green selection with a green-11 edge on
 * paper; on forest the selection is the inverse pair (a paper-colored fill
 * with a loam ✓).
 */
export function CheckboxGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <span className={styles.name}>{preset}</span>
          <div>
            <Checkbox defaultChecked>Checked</Checkbox>
            <Checkbox>Unchecked</Checkbox>
            <Checkbox indeterminate>Some Selected</Checkbox>
            <Checkbox disabled defaultChecked>
              Unavailable
            </Checkbox>
          </div>
          <Checkbox kind="card" defaultChecked valueLabel="+ $75.00">
            Oak Frame
          </Checkbox>
        </PresetGround>
      ))}
    </div>
  )
}

import { Radio } from '@fairgarden-private/design/components/Radio'
import { RadioGroup } from '@fairgarden-private/design/components/RadioGroup'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** Green selection on paper; the inverse pair on forest, for circles and pills alike. */
export function RadioGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <span className={styles.name}>{preset}</span>
          <RadioGroup aria-label={`Trail length on ${preset}`} defaultValue="short">
            <Radio value="short">Short Loop</Radio>
            <Radio value="long">Long Loop</Radio>
            <Radio value="closed" disabled>
              Closed Loop
            </Radio>
          </RadioGroup>
          <RadioGroup kind="pill" aria-label={`Pace on ${preset}`} defaultValue="easy">
            <Radio value="easy">Easy Pace</Radio>
            <Radio value="brisk">Brisk Pace</Radio>
          </RadioGroup>
        </PresetGround>
      ))}
    </div>
  )
}

import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { PresetGround } from '@/components/PresetGround'
import { Select } from '@fairgarden/design/forms/select'
import styles from './grounds.module.css'

const seasons = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'winter', label: 'Winter' },
]

const presets = ['paper', 'forest'] as const

/**
 * The trigger follows its ground (on forest the underline takes the deep
 * accent); the popup is always the white scope, which follows the page mode.
 */
export function SelectGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Field>
            <FieldLabel nativeLabel={false}>Season</FieldLabel>
            <Select items={seasons} defaultValue="autumn" />
          </Field>
          <Field>
            <FieldLabel nativeLabel={false}>Show</FieldLabel>
            <Select variant="underline" items={seasons} defaultValue="spring" />
          </Field>
        </PresetGround>
      ))}
    </div>
  )
}

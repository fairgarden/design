import { Field, FieldLabel } from '@fairgarden-private/design/components/Field'
import { PresetGround } from '@/components/PresetGround'
import { NumberField } from '@fairgarden-private/design/components/NumberField'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** The stepper on paper and forest: the held cell is a light fill with a dark glyph on the deep ground. */
export function NumberFieldGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Field>
            <FieldLabel>Campers</FieldLabel>
            <NumberField min={1} max={8} defaultValue={2} />
          </Field>
          <Field>
            <FieldLabel>Distance</FieldLabel>
            <NumberField kind="amount" defaultValue={12} suffix="km" />
          </Field>
        </PresetGround>
      ))}
    </div>
  )
}

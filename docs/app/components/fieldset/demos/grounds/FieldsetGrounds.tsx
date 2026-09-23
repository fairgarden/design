import { Field, FieldLabel } from '@fairgarden-private/design/components/Field'
import { Fieldset, FieldsetLegend } from '@fairgarden-private/design/components/Fieldset'
import { PresetGround } from '@/components/PresetGround'
import { Input } from '@fairgarden-private/design/components/Input'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** Open and framed fieldsets on paper and forest. */
export function FieldsetGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Fieldset>
            <FieldsetLegend>Contact</FieldsetLegend>
            <Field>
              <FieldLabel>Email Address</FieldLabel>
              <Input type="email" />
            </Field>
          </Fieldset>
          <Fieldset variant="outline">
            <FieldsetLegend>Calculator</FieldsetLegend>
            <Field>
              <FieldLabel>Distance</FieldLabel>
              <Input suffix="km" />
            </Field>
          </Fieldset>
        </PresetGround>
      ))}
    </div>
  )
}

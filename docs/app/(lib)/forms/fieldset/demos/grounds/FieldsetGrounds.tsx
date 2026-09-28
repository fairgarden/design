import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { Fieldset, FieldsetLegend } from '@fairgarden/design/forms/fieldset'
import { PresetGround } from '@/components/PresetGround'
import { Input } from '@fairgarden/design/forms/input'
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

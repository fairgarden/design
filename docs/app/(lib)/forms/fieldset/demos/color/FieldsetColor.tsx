import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { Fieldset, FieldsetLegend } from '@fairgarden/design/forms/fieldset'
import { Input } from '@fairgarden/design/forms/input'
import styles from './color.module.css'

/** Structure takes `primary` only: legend, frame and rules. */
export function FieldsetColor() {
  return (
    <div className={styles.stack}>
      <Fieldset primary="plum">
        <FieldsetLegend>Primary Plum</FieldsetLegend>
        <Field>
          <FieldLabel>City</FieldLabel>
          <Input />
        </Field>
      </Fieldset>
      <Fieldset variant="outline" primary="indigo">
        <FieldsetLegend>Primary Indigo</FieldsetLegend>
        <Field>
          <FieldLabel>Region</FieldLabel>
          <Input />
        </Field>
      </Fieldset>
    </div>
  )
}

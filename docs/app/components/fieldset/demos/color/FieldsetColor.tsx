import { Field, FieldLabel } from '@fairgarden-private/design/components/Field'
import { Fieldset, FieldsetLegend } from '@fairgarden-private/design/components/Fieldset'
import { Input } from '@fairgarden-private/design/components/Input'
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

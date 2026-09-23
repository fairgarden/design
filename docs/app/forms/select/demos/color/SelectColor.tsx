import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { Select } from '@fairgarden/design/forms/select'
import styles from './color.module.css'

const sizes = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
]

/**
 * `primary` recolors the trigger; `secondary` drives the underline's
 * accent. The popup is always the white scope with its own defaults.
 */
export function SelectColor() {
  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel nativeLabel={false}>Primary Plum</FieldLabel>
        <Select primary="plum" items={sizes} defaultValue="m" />
      </Field>
      <Field>
        <FieldLabel nativeLabel={false}>Secondary Orange</FieldLabel>
        <Select variant="underline" secondary="orange" items={sizes} defaultValue="l" />
      </Field>
    </div>
  )
}

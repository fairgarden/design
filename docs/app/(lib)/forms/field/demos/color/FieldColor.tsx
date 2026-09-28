import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@fairgarden/design/forms/field'
import { Input } from '@fairgarden/design/forms/input'
import styles from './color.module.css'

/**
 * `primary` recolors the label, description and, by inheritance, the
 * control. While invalid the error always takes the danger scale.
 */
export function FieldColor() {
  return (
    <div className={styles.stack}>
      <Field primary="plum">
        <FieldLabel>Trail Name</FieldLabel>
        <Input placeholder="Ridge loop…" />
        <FieldDescription>Primary plum: label, edge, value and ring.</FieldDescription>
      </Field>
      <Field primary="slate" secondary="indigo" invalid>
        <FieldLabel>Group Size</FieldLabel>
        <Input defaultValue="40" />
        <FieldError match>Groups are 12 or fewer. Enter 1–12.</FieldError>
      </Field>
    </div>
  )
}

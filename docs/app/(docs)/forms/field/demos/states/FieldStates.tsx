import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@fairgarden/design/forms/field'
import { Input } from '@fairgarden/design/forms/input'
import styles from './states.module.css'

/**
 * Rest, optional, invalid and disabled fields. The invalid field passes the
 * danger scale to its control and error; the label stays --primary12.
 */
export function FieldStates() {
  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel>Email Address</FieldLabel>
        <Input type="email" placeholder="Email address…" />
        <FieldDescription>We send one trail report a month.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel optional>Phone Number</FieldLabel>
        <Input type="tel" />
      </Field>
      <Field invalid>
        <FieldLabel>Postcode</FieldLabel>
        <Input defaultValue="12" style={{ inlineSize: '8ch' }} />
        <FieldError match>Postcode is too short. Enter all 5 digits.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel>Member Number</FieldLabel>
        <Input defaultValue="FG-2041" />
        <FieldDescription>Assigned when your membership starts.</FieldDescription>
      </Field>
    </div>
  )
}

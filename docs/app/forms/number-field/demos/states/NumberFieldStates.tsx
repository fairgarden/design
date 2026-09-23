import { Field, FieldError, FieldLabel } from '@fairgarden/design/forms/field'
import { NumberField } from '@fairgarden/design/forms/number-field'
import styles from './states.module.css'

/**
 * The stepper (at its minimum, so − is disabled), the amount and the
 * readout, then invalid, read-only and disabled fields.
 */
export function NumberFieldStates() {
  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel>Tickets</FieldLabel>
        <NumberField min={1} max={12} defaultValue={1} suffix="adults" />
      </Field>
      <Field>
        <FieldLabel>Donation</FieldLabel>
        <NumberField kind="amount" prefix="$" suffix="USD" defaultValue={50} min={1} />
      </Field>
      <Field>
        <NumberField label="Water" scrub kind="readout" defaultValue={2.5} step={0.5} suffix="litres" />
      </Field>
      <Field invalid>
        <FieldLabel>Group Size</FieldLabel>
        <NumberField min={1} max={12} defaultValue={14} allowOutOfRange />
        <FieldError match>Enter 1–12.</FieldError>
      </Field>
      <Field>
        <FieldLabel>Nights Booked</FieldLabel>
        <NumberField readOnly defaultValue={3} />
      </Field>
      <Field disabled>
        <FieldLabel>Guides</FieldLabel>
        <NumberField defaultValue={2} />
      </Field>
    </div>
  )
}

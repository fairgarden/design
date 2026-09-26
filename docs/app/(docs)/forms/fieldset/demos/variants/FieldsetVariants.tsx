import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import {
  Fieldset,
  FieldsetLeader,
  FieldsetLegend,
} from '@fairgarden/design/forms/fieldset'
import { Input } from '@fairgarden/design/forms/input'
import { NumberField } from '@fairgarden/design/forms/number-field'
import styles from './variants.module.css'

/** Open (default), framed and ledger fieldsets, and a disabled group. */
export function FieldsetVariants() {
  return (
    <div className={styles.stack}>
      <Fieldset>
        <FieldsetLegend>Contact</FieldsetLegend>
        <Field>
          <FieldLabel>Email Address</FieldLabel>
          <Input type="email" />
        </Field>
        <Field>
          <FieldLabel optional>Phone Number</FieldLabel>
          <Input type="tel" />
        </Field>
      </Fieldset>
      <Fieldset variant="outline">
        <FieldsetLegend>Water Calculator</FieldsetLegend>
        <Field>
          <FieldLabel>Hiking Hours</FieldLabel>
          <NumberField min={1} max={12} defaultValue={4} suffix="h" />
        </Field>
      </Fieldset>
      <Fieldset variant="ledger">
        <FieldsetLegend>Print Order</FieldsetLegend>
        <Field className={styles.ledgerRow}>
          <FieldLabel>Heron Print</FieldLabel>
          <FieldsetLeader />
          <Input defaultValue="1" style={{ inlineSize: '8ch' }} />
        </Field>
        <Field className={styles.ledgerRow}>
          <FieldLabel>Egret Print</FieldLabel>
          <FieldsetLeader />
          <Input defaultValue="0" style={{ inlineSize: '8ch' }} />
        </Field>
      </Fieldset>
      <Fieldset disabled>
        <FieldsetLegend>Shipping Address</FieldsetLegend>
        <Field>
          <FieldLabel>Street</FieldLabel>
          <Input defaultValue="12 Marsh Lane" />
        </Field>
      </Fieldset>
    </div>
  )
}

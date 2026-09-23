import { Field, FieldLabel } from '@fairgarden-private/design/components/Field'
import { NumberField } from '@fairgarden-private/design/components/NumberField'
import styles from './color.module.css'

/** `primary` recolors the group edge, dividers, glyphs, value and the held cell's inverse pair. */
export function NumberFieldColor() {
  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel>Primary Plum</FieldLabel>
        <NumberField primary="plum" defaultValue={4} min={0} max={20} suffix="kg" />
      </Field>
      <Field>
        <FieldLabel>Primary Slate</FieldLabel>
        <NumberField primary="slate" kind="amount" prefix="€" defaultValue={25} />
      </Field>
    </div>
  )
}

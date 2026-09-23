'use client'

import {
  Combobox,
  type ComboboxOption,
} from '@fairgarden/design/forms/combobox'
import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import styles from './color.module.css'

const towns: ComboboxOption[] = [
  { value: 'ashby', label: 'Ashby' },
  { value: 'bexley', label: 'Bexley' },
  { value: 'carrow', label: 'Carrow' },
  { value: 'dunmore', label: 'Dunmore' },
]

/** `primary` recolors the box and the chips inside it; the popup keeps the white scope's defaults. */
export function ComboboxColor() {
  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel nativeLabel={false}>Primary Plum</FieldLabel>
        <Combobox primary="plum" multiple items={towns} defaultValue={[towns[1]]} />
      </Field>
      <Field>
        <FieldLabel nativeLabel={false}>Primary Slate</FieldLabel>
        <Combobox primary="slate" items={towns} placeholder="Choose a town…" />
      </Field>
    </div>
  )
}

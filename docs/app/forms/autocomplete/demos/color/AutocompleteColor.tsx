'use client'

import {
  Autocomplete,
  type AutocompleteOption,
} from '@fairgarden/design/forms/autocomplete'
import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import styles from './color.module.css'

const topics: AutocompleteOption[] = [
  { value: 'Birding' },
  { value: 'Botany' },
  { value: 'Bouldering' },
  { value: 'Butterflies' },
]

/** `primary` recolors the box and its icons; the popup keeps the white scope's defaults. */
export function AutocompleteColor() {
  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel>Primary Plum</FieldLabel>
        <Autocomplete primary="plum" items={topics} icon="search" placeholder="Topic…" />
      </Field>
      <Field>
        <FieldLabel>Primary Indigo</FieldLabel>
        <Autocomplete primary="indigo" items={topics} placeholder="Topic…" />
      </Field>
    </div>
  )
}

'use client'

import {
  Autocomplete,
  type AutocompleteOption,
} from '@fairgarden/design/forms/autocomplete'
import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const rivers: AutocompleteOption[] = [
  { value: 'Avon' },
  { value: 'Derwent' },
  { value: 'Severn' },
  { value: 'Tweed' },
]

const presets = ['paper', 'forest'] as const

/** The box follows its ground; the suggestion popup is always the white scope. */
export function AutocompleteGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Field>
            <FieldLabel>River</FieldLabel>
            <Autocomplete items={rivers} icon="search" placeholder="River name…" />
          </Field>
        </PresetGround>
      ))}
    </div>
  )
}

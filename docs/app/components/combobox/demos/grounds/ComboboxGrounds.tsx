'use client'

import {
  Combobox,
  type ComboboxOption,
} from '@fairgarden-private/design/components/Combobox'
import { Field, FieldLabel } from '@fairgarden-private/design/components/Field'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const parks: ComboboxOption[] = [
  { value: 'acadia', label: 'Acadia' },
  { value: 'everglades', label: 'Everglades' },
  { value: 'glacier', label: 'Glacier' },
  { value: 'olympic', label: 'Olympic' },
]

const presets = ['paper', 'forest'] as const

/** The box and its chips follow the ground; the popup is always the white scope. */
export function ComboboxGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Field>
            <FieldLabel nativeLabel={false}>Parks Visited</FieldLabel>
            <Combobox multiple items={parks} defaultValue={[parks[0]]} placeholder="Add a park…" />
          </Field>
        </PresetGround>
      ))}
    </div>
  )
}

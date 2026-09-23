'use client'

import * as React from 'react'
import {
  Autocomplete,
  type AutocompleteOption,
} from '@fairgarden-private/design/components/Autocomplete'
import { Field, FieldDescription, FieldLabel } from '@fairgarden-private/design/components/Field'
import styles from './states.module.css'

const streets: AutocompleteOption[] = [
  { value: '12 Marsh Lane' },
  { value: '14 Marsh Lane' },
  { value: '3 Heron Close' },
  { value: '27 Heron Way' },
  { value: '9 Osprey Road' },
  { value: '41 Tern Street' },
]

const places = [
  { label: 'Towns', items: [{ value: 'Ashby' }, { value: 'Bexley' }, { value: 'Carrow' }] },
  { label: 'Parks', items: [{ value: 'Ashby Common' }, { value: 'Bexley Woods' }] },
]

/**
 * Free text with suggestions: any value is valid. Then a loading field
 * (the "Searching…" row), a fetch failure and a disabled field.
 */
export function AutocompleteStates() {
  const [loading, setLoading] = React.useState(false)

  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel>Street Address</FieldLabel>
        <Autocomplete items={streets} placeholder="Start with the number…" />
        <FieldDescription>Pick a suggestion or keep typing.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Meeting Place</FieldLabel>
        <Autocomplete items={places} icon="search" showTrigger placeholder="Town or park…" />
      </Field>
      <Field>
        <FieldLabel>Nearest Station</FieldLabel>
        <Autocomplete
          items={[]}
          filter={null}
          loading={loading}
          onValueChange={(value) => setLoading(value.trim() !== '')}
          placeholder="Type to search…"
        />
      </Field>
      <Field>
        <FieldLabel>Parish</FieldLabel>
        <Autocomplete
          items={[]}
          filter={null}
          error="Couldn't load suggestions. Keep typing or try again."
          placeholder="Type to search…"
        />
      </Field>
      <Field disabled>
        <FieldLabel>County</FieldLabel>
        <Autocomplete items={streets} defaultValue="Heron County" />
      </Field>
    </div>
  )
}

'use client'

import * as React from 'react'
import {
  Combobox,
  type ComboboxOption,
} from '@fairgarden-private/design/components/Combobox'
import { Field, FieldError, FieldLabel } from '@fairgarden-private/design/components/Field'
import styles from './states.module.css'

const species: ComboboxOption[] = [
  { value: 'heron', label: 'Great Blue Heron' },
  { value: 'egret', label: 'Great Egret' },
  { value: 'bittern', label: 'American Bittern' },
  { value: 'ibis', label: 'Glossy Ibis' },
  { value: 'rail', label: 'Clapper Rail' },
  { value: 'stilt', label: 'Black-necked Stilt' },
  { value: 'avocet', label: 'American Avocet' },
  { value: 'plover', label: 'Piping Plover' },
  { value: 'tern', label: 'Least Tern' },
  { value: 'skimmer', label: 'Black Skimmer' },
  { value: 'osprey', label: 'Osprey' },
  { value: 'kingfisher', label: 'Belted Kingfisher' },
  { value: 'grebe', label: 'Pied-billed Grebe' },
  { value: 'coot', label: 'American Coot' },
  { value: 'gallinule', label: 'Common Gallinule' },
  { value: 'sora', label: 'Sora' },
]

const habitats = [
  {
    label: 'Wetland',
    items: [
      { value: 'marsh', label: 'Salt Marsh' },
      { value: 'swamp', label: 'Cypress Swamp' },
    ],
  },
  {
    label: 'Upland',
    items: [
      { value: 'prairie', label: 'Tallgrass Prairie' },
      { value: 'oak', label: 'Oak Savanna' },
    ],
  },
]

/**
 * Single, multiple (chips), grouped and creatable comboboxes, then invalid
 * and disabled ones. Matches in the list are marked by weight.
 */
export function ComboboxStates() {
  const [tags, setTags] = React.useState<ComboboxOption[]>([
    { value: 'dawn', label: 'Dawn Walk' },
    { value: 'family', label: 'Family' },
  ])
  const [chosenTags, setChosenTags] = React.useState<ComboboxOption[]>([])

  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel nativeLabel={false}>Species</FieldLabel>
        <Combobox items={species} placeholder="Start typing a name…" />
      </Field>
      <Field>
        <FieldLabel nativeLabel={false}>Birds Seen</FieldLabel>
        <Combobox
          multiple
          items={species}
          defaultValue={[species[0], species[1]]}
          placeholder="Add a bird…"
        />
      </Field>
      <Field>
        <FieldLabel nativeLabel={false}>Habitat</FieldLabel>
        <Combobox items={habitats} icon="search" placeholder="Search habitats…" />
      </Field>
      <Field>
        <FieldLabel nativeLabel={false} optional>
          Tags
        </FieldLabel>
        <Combobox
          multiple
          items={tags}
          value={chosenTags}
          onValueChange={setChosenTags}
          onCreate={(query) => {
            const option = { value: query.toLowerCase(), label: query }
            setTags((current) => [...current, option])
            setChosenTags((current) => [...current, option])
          }}
          placeholder="Add a tag…"
        />
      </Field>
      <Field invalid>
        <FieldLabel nativeLabel={false}>Leader</FieldLabel>
        <Combobox items={species} placeholder="Choose a leader…" />
        <FieldError match>Choose a leader from the list.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel nativeLabel={false}>Reviewer</FieldLabel>
        <Combobox items={species} defaultValue={species[10]} />
      </Field>
    </div>
  )
}

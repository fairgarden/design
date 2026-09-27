import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { Select } from '@fairgarden/design/forms/select'
import styles from './morph.module.css'

const trails = [
  { value: 'ridge', label: 'Ridge Loop' },
  { value: 'marsh', label: 'Marsh Boardwalk' },
  { value: 'falls', label: 'Falls Trail' },
  { value: 'summit', label: 'Summit Path', disabled: true },
  { value: 'meadow', label: 'Meadow Walk' },
]

const regions = [
  {
    label: 'North',
    items: [
      { value: 'pines', label: 'Pine Barrens' },
      { value: 'lakes', label: 'Lake Country' },
    ],
  },
  {
    label: 'South',
    items: [
      { value: 'delta', label: 'River Delta' },
      { value: 'dunes', label: 'Coastal Dunes' },
    ],
  },
]

const meetingPoints = [
  { value: 'gate', label: 'North Gate' },
  { value: 'barn', label: 'Visitor Barn' },
  { value: 'bridge', label: 'Footbridge' },
  { value: 'orchard', label: 'Old Orchard' },
  { value: 'pond', label: 'Heron Pond' },
  { value: 'tower', label: 'Fire Tower' },
  { value: 'lot', label: 'South Lot' },
  { value: 'shelter', label: 'Picnic Shelter' },
]

/**
 * The outline morph (on by default): the focus ring grows into the popup's
 * frame, and back on close. Open one from the keyboard to see the ring
 * grow; by pointer, the field edge grows instead. The last select sits at
 * the foot of a tall stage, so with the demo at the top of the window it
 * opens upward and the outline grows up.
 */
export function SelectMorph() {
  return (
    <div className={styles.stage}>
      <Field>
        <FieldLabel nativeLabel={false}>Trail</FieldLabel>
        <Select items={trails} placeholder="Choose a trail…" />
      </Field>
      <Field>
        <FieldLabel nativeLabel={false}>Sort By</FieldLabel>
        <Select variant="underline" items={trails} defaultValue="marsh" />
      </Field>
      <Field>
        <FieldLabel nativeLabel={false}>Region</FieldLabel>
        <Select items={regions} placeholder="Choose a region…" />
      </Field>
      <Field className={styles.foot}>
        <FieldLabel nativeLabel={false}>Meeting Point</FieldLabel>
        <Select items={meetingPoints} defaultValue="barn" />
      </Field>
    </div>
  )
}

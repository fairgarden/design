import { Field, FieldError, FieldLabel } from '@fairgarden-private/design/components/Field'
import { Select } from '@fairgarden-private/design/components/Select'
import styles from './states.module.css'

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

const colors = [
  { value: 'moss', label: 'Moss Green', swatch: '#5b7f3a' },
  { value: 'clay', label: 'Clay Orange', swatch: '#c2622d' },
  { value: 'slate', label: 'Slate Blue', swatch: '#4f6a86' },
]

/**
 * Boxed and underline triggers, groups, a swatch-led select, then invalid
 * and disabled triggers. The swatch colors are content, like a photograph.
 */
export function SelectStates() {
  return (
    <div className={styles.stack}>
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
      <Field>
        <FieldLabel nativeLabel={false}>Jacket Color</FieldLabel>
        <Select items={colors} defaultValue="moss" />
      </Field>
      <Field invalid>
        <FieldLabel nativeLabel={false}>Start Point</FieldLabel>
        <Select items={trails} placeholder="Choose a start point…" />
        <FieldError match>Choose where your walk starts.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel nativeLabel={false}>Guide</FieldLabel>
        <Select items={trails} defaultValue="falls" />
      </Field>
    </div>
  )
}

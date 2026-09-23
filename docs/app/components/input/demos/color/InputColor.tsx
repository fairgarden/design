import { Field, FieldLabel } from '@fairgarden-private/design/components/Field'
import { Input } from '@fairgarden-private/design/components/Input'
import styles from './color.module.css'

/**
 * `primary` recolors the edge, value, icon and ring; the butted action
 * keeps the scope's action scale, as a `solid` Button does.
 */
export function InputColor() {
  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel>Primary Plum</FieldLabel>
        <Input primary="plum" icon="search" placeholder="Search the guide…" />
      </Field>
      <Field>
        <FieldLabel>Primary Indigo</FieldLabel>
        <Input
          primary="indigo"
          butted="end"
          action={{ label: 'Send', type: 'button' }}
          placeholder="Email address…"
        />
      </Field>
    </div>
  )
}

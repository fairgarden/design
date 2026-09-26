import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { PresetGround } from '@/components/PresetGround'
import { Input } from '@fairgarden/design/forms/input'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/**
 * Open fields on paper and forest; the action cell stays amber, its edge
 * equal to its fill on the deep ground. The plate is for patterned grounds.
 */
export function InputGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Field>
            <FieldLabel>Email Address</FieldLabel>
            <Input
              type="email"
              placeholder="Email address…"
              butted="end"
              action={{ label: 'Sign Up', type: 'button' }}
            />
          </Field>
          <Field>
            <FieldLabel>On a Plate</FieldLabel>
            <Input plate placeholder="For patterned grounds…" />
          </Field>
        </PresetGround>
      ))}
    </div>
  )
}

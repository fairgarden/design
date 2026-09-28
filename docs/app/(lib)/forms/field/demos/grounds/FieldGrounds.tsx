import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@fairgarden/design/forms/field'
import { PresetGround } from '@/components/PresetGround'
import { Input } from '@fairgarden/design/forms/input'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** The same fields on paper and forest: the roles resolve per ground. */
export function FieldGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Field>
            <FieldLabel>Your Name</FieldLabel>
            <Input placeholder="First and last name…" />
            <FieldDescription>As it appears on your card.</FieldDescription>
          </Field>
          <Field invalid>
            <FieldLabel>Email Address</FieldLabel>
            <Input defaultValue="heron@" />
            <FieldError match>Enter an email address, like name@example.com.</FieldError>
          </Field>
        </PresetGround>
      ))}
    </div>
  )
}

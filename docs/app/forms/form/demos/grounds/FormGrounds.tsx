import { Button } from '@fairgarden/design/actions/button'
import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { Form, FormActions } from '@fairgarden/design/forms/form'
import { PresetGround } from '@/components/PresetGround'
import { Input } from '@fairgarden/design/forms/input'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** A short form on paper and forest; the submit keeps the scope's action. */
export function FormGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Form>
            <Field>
              <FieldLabel>Email Address</FieldLabel>
              <Input type="email" />
            </Field>
            <FormActions>
              <Button type="submit" variant="solid" size="lg">
                Sign Up
              </Button>
            </FormActions>
          </Form>
        </PresetGround>
      ))}
    </div>
  )
}

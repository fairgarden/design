import { Button } from '@fairgarden-private/design/components/Button'
import { Field, FieldLabel } from '@fairgarden-private/design/components/Field'
import { Form, FormActions } from '@fairgarden-private/design/components/Form'
import { Input } from '@fairgarden-private/design/components/Input'

/** `primary` on the Form reaches every field inside it by inheritance. */
export function FormColor() {
  return (
    <Form primary="plum">
      <Field>
        <FieldLabel>Your Name</FieldLabel>
        <Input />
      </Field>
      <FormActions>
        <Button type="submit" variant="solid" size="lg">
          Send
        </Button>
      </FormActions>
    </Form>
  )
}

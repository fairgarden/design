import { Button } from '@fairgarden/design/actions/button'
import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { Form, FormActions } from '@fairgarden/design/forms/form'
import { Input } from '@fairgarden/design/forms/input'

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

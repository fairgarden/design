'use client'

import * as React from 'react'
import { Button } from '@fairgarden-private/design/components/Button'
import { Field, FieldError, FieldLabel } from '@fairgarden-private/design/components/Field'
import {
  Form,
  FormActions,
  FormRow,
  FormSummary,
} from '@fairgarden-private/design/components/Form'
import { Input } from '@fairgarden-private/design/components/Input'

type Errors = Record<string, string>

/**
 * Submit with empty fields to see the summary take focus and the fields
 * take the error state; a valid submit shows the busy form for a moment.
 */
export function FormStates() {
  const [errors, setErrors] = React.useState<Errors>({})
  const [busy, setBusy] = React.useState(false)

  const submit = (values: Record<string, unknown>) => {
    const next: Errors = {}
    if (!values.email) next.email = 'Enter an email address, like name@example.com.'
    if (!values.postcode) next.postcode = 'Enter a postcode.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setBusy(true)
    window.setTimeout(() => setBusy(false), 1500)
  }

  const count = Object.keys(errors).length

  return (
    <Form errors={errors} onFormSubmit={submit} busy={busy}>
      {count > 0 ? (
        <FormSummary
          title={`Fix ${count} ${count === 1 ? 'field' : 'fields'} to continue`}
          errors={Object.entries(errors).map(([name, message]) => ({
            id: `form-demo-${name}`,
            message,
          }))}
        />
      ) : null}
      <Field name="email">
        <FieldLabel>Email Address</FieldLabel>
        <Input id="form-demo-email" type="email" placeholder="Email address…" />
        <FieldError />
      </Field>
      <FormRow>
        <Field name="city">
          <FieldLabel optional>City</FieldLabel>
          <Input id="form-demo-city" />
        </Field>
        <Field name="postcode">
          <FieldLabel>Postcode</FieldLabel>
          <Input id="form-demo-postcode" />
          <FieldError />
        </Field>
      </FormRow>
      <FormActions>
        <Button type="reset" size="lg" destructive>
          Clear
        </Button>
        <Button type="submit" variant="solid" size="lg" aria-busy={busy || undefined}>
          {busy ? 'Sending…' : 'Join the Walk'}
        </Button>
      </FormActions>
    </Form>
  )
}

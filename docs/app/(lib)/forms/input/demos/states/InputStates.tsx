'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@fairgarden/design/forms/field'
import { Input } from '@fairgarden/design/forms/input'
import styles from './states.module.css'

/**
 * The boxed field and its builds: adorned, label-inside, underline,
 * textarea with a count, password reveal and the butted action, then the
 * invalid, read-only and disabled states.
 */
export function InputStates() {
  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel>Email Address</FieldLabel>
        <Input type="email" placeholder="Email address…" />
      </Field>
      <Field>
        <FieldLabel>Donation</FieldLabel>
        <Input inputMode="decimal" prefix="$" suffix="USD" defaultValue="50" />
      </Field>
      <Field>
        <FieldLabel>Find a Trail</FieldLabel>
        <Input icon="search" placeholder="Trail or town…" />
      </Field>
      <Field>
        <Input labelInside label="Full Name" defaultValue="Ada Heron" />
      </Field>
      <Field>
        <FieldLabel>Display Name</FieldLabel>
        <Input variant="underline" defaultValue="heron_watch" />
      </Field>
      <Field>
        <FieldLabel>Trip Notes</FieldLabel>
        <Input multiline limit={200} placeholder="What did you see…" />
        <FieldDescription>Up to 200 characters.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Password</FieldLabel>
        <Input type="password" reveal defaultValue="marsh-lantern" />
      </Field>
      <Field>
        <FieldLabel>Newsletter</FieldLabel>
        <Input
          type="email"
          placeholder="Email address…"
          butted="end"
          action={{ label: 'Sign Up', labelled: true, type: 'button' }}
        />
      </Field>
      <Field invalid>
        <FieldLabel>Website</FieldLabel>
        <Input type="url" defaultValue="fairgarden" />
        <FieldError match>Enter a full address, starting with https://.</FieldError>
      </Field>
      <Field>
        <FieldLabel>Member Since</FieldLabel>
        <Input readOnly defaultValue="March 2019" />
      </Field>
      <Field disabled>
        <FieldLabel>Referral Code</FieldLabel>
        <Input placeholder="Code…" />
      </Field>
    </div>
  )
}

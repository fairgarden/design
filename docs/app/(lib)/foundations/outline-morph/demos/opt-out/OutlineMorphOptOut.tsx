'use client'

import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { Select } from '@fairgarden/design/forms/select'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@fairgarden/design/overlays/menu'
import styles from './opt-out.module.css'

const sorts = [
  { value: 'name', label: 'Name' },
  { value: 'distance', label: 'Distance' },
  { value: 'newest', label: 'Newest' },
]

/**
 * Two ways to turn the outline morph off: `morph={false}` on one
 * component, and `--fgd-outline-morph: none` on a region (or `:root`),
 * which every trigger inside inherits. Both popups open and close at
 * once instead.
 */
export function OutlineMorphOptOut() {
  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel nativeLabel={false}>Sort By</FieldLabel>
        <Select morph={false} items={sorts} defaultValue="name" />
      </Field>
      <div className={styles.quiet}>
        <Menu>
          <MenuTrigger variant="outline" icon="expand_more" iconPosition="end">
            Share
          </MenuTrigger>
          <MenuPopup>
            <MenuItem icon="link">Copy link</MenuItem>
            <MenuItem icon="mail">Email</MenuItem>
          </MenuPopup>
        </Menu>
      </div>
    </div>
  )
}

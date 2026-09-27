'use client'

import { Combobox } from '@fairgarden/design/forms/combobox'
import { Field, FieldLabel } from '@fairgarden/design/forms/field'
import { Select } from '@fairgarden/design/forms/select'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@fairgarden/design/overlays/menu'
import {
  Popover,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from '@fairgarden/design/overlays/popover'
import styles from './components.module.css'

const trails = [
  { value: 'ridge', label: 'Ridge Loop' },
  { value: 'marsh', label: 'Marsh Boardwalk' },
  { value: 'falls', label: 'Falls Trail' },
  { value: 'meadow', label: 'Meadow Walk' },
]

const species = [
  { value: 'heron', label: 'Great Blue Heron' },
  { value: 'egret', label: 'Great Egret' },
  { value: 'bittern', label: 'American Bittern' },
  { value: 'ibis', label: 'Glossy Ibis' },
  { value: 'osprey', label: 'Osprey' },
  { value: 'kingfisher', label: 'Belted Kingfisher' },
]

/**
 * The outline morph where it runs by default: a Select, a Combobox (the
 * ring stays on the box while you type), a Menu's Button and a Popover's.
 * Tab to a trigger and open it from the keyboard to see the ring grow; by
 * pointer, the trigger's edge grows instead.
 */
export function OutlineMorphComponents() {
  return (
    <div className={styles.stack}>
      <Field>
        <FieldLabel nativeLabel={false}>Trail</FieldLabel>
        <Select items={trails} placeholder="Choose a trail…" />
      </Field>
      <Field>
        <FieldLabel nativeLabel={false}>Species</FieldLabel>
        <Combobox items={species} placeholder="Search species…" />
      </Field>
      <div className={styles.row}>
        <Menu>
          <MenuTrigger variant="outline" icon="expand_more" iconPosition="end">
            Export
          </MenuTrigger>
          <MenuPopup>
            <MenuItem icon="download">Download CSV</MenuItem>
            <MenuItem icon="content_copy">Copy as text</MenuItem>
            <MenuItem icon="link">Copy link</MenuItem>
          </MenuPopup>
        </Menu>
        <Popover>
          <PopoverTrigger variant="text" icon="help" iconPosition="end">
            Trail Conditions
          </PopoverTrigger>
          <PopoverPopup>
            <PopoverTitle>Open, some mud</PopoverTitle>
            <PopoverDescription>
              The boardwalk reopened on Friday. Expect wet ground past the second bridge.
            </PopoverDescription>
          </PopoverPopup>
        </Popover>
      </div>
    </div>
  )
}

import { Checkbox } from '@fairgarden-private/design/components/Checkbox'
import { CheckboxGroup } from '@fairgarden-private/design/components/CheckboxGroup'
import styles from './color.module.css'

/**
 * `secondary` drives the checked fill, mark and edge through --role-select;
 * `primary` drives the box edge, label and focus ring. A group passes its
 * scales to every checkbox inside.
 */
export function CheckboxColor() {
  return (
    <div className={styles.grid}>
      <Checkbox defaultChecked>Scope Colors</Checkbox>
      <Checkbox defaultChecked secondary="indigo">
        Secondary Indigo
      </Checkbox>
      <Checkbox primary="plum">Primary Plum</Checkbox>
      <CheckboxGroup secondary="teal" aria-label="Teal group" defaultValue={['teal']}>
        <Checkbox value="teal">Group in Teal</Checkbox>
      </CheckboxGroup>
    </div>
  )
}

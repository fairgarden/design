import { Radio } from '@fairgarden-private/design/components/Radio'
import { RadioGroup } from '@fairgarden-private/design/components/RadioGroup'
import styles from './color.module.css'

/**
 * `secondary` drives the checked fill, dot and edge; `primary` drives the
 * circle edge, labels and focus ring. A group passes its scales down.
 */
export function RadioColor() {
  return (
    <div className={styles.grid}>
      <RadioGroup aria-label="Scope colors" defaultValue="a">
        <Radio value="a">Scope Colors</Radio>
        <Radio value="b">Unchecked</Radio>
      </RadioGroup>
      <RadioGroup aria-label="Secondary indigo" secondary="indigo" defaultValue="a">
        <Radio value="a">Secondary Indigo</Radio>
        <Radio value="b">Unchecked</Radio>
      </RadioGroup>
      <RadioGroup aria-label="Primary plum" primary="plum" defaultValue="a">
        <Radio value="a">Primary Plum</Radio>
        <Radio value="b">Unchecked</Radio>
      </RadioGroup>
    </div>
  )
}

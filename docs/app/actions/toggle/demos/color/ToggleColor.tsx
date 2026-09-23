import { Toggle } from '@fairgarden/design/actions/toggle'
import { ToggleGroup } from '@fairgarden/design/actions/toggle-group'
import styles from './color.module.css'

/**
 * Toggles and segments draw every part from `primary`; `secondary` drives
 * only the selected filter chip.
 */
export function ToggleColor() {
  return (
    <div className={styles.grid}>
      <Toggle defaultPressed primary="plum">
        Primary Plum
      </Toggle>
      <ToggleGroup variant="chip" multiple aria-label="Scope chips" defaultValue={['a']}>
        <Toggle value="a">Scope Chip</Toggle>
      </ToggleGroup>
      <ToggleGroup
        variant="chip"
        multiple
        secondary="indigo"
        aria-label="Indigo chips"
        defaultValue={['a']}
      >
        <Toggle value="a">Secondary Indigo</Toggle>
      </ToggleGroup>
    </div>
  )
}

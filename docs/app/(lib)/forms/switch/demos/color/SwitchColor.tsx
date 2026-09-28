import { Switch } from '@fairgarden/design/forms/switch'
import styles from './color.module.css'

/**
 * `secondary` drives the on track and thumb through --role-select;
 * `primary` drives the off track, thumb ring, label and state word.
 */
export function SwitchColor() {
  return (
    <div className={styles.grid}>
      <Switch kind="inline" defaultChecked>
        Scope Colors
      </Switch>
      <Switch kind="inline" defaultChecked secondary="indigo">
        Secondary Indigo
      </Switch>
      <Switch kind="inline" primary="plum">
        Primary Plum
      </Switch>
    </div>
  )
}

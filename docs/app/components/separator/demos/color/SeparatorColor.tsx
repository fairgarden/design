import { Separator } from '@fairgarden-private/design/components/Separator'
import styles from './color.module.css'

/** Rules and hairlines are primary roles: `primary` recolors them. */
export function SeparatorColor() {
  return (
    <div className={styles.stack}>
      <code className={styles.name}>scope default (olive)</code>
      <Separator />
      <code className={styles.name}>primary=&quot;plum&quot;</code>
      <Separator primary="plum" />
      <code className={styles.name}>primary=&quot;indigo&quot; variant=&quot;doubleHair&quot;</code>
      <Separator primary="indigo" variant="doubleHair" />
    </div>
  )
}

import { Link } from '@fairgarden/design/actions/link'
import styles from './color.module.css'

/** The underline is the secondary's accent; the text stays the primary's step 12. */
export function LinkColor() {
  return (
    <div className={styles.stack}>
      <p className={styles.text}>
        Scope defaults: <Link href="#color">olive × green</Link>
      </p>
      <p className={styles.text}>
        <Link href="#color" secondary="indigo">
          secondary=&quot;indigo&quot;
        </Link>
      </p>
      <p className={styles.text}>
        <Link href="#color" primary="plum" secondary="pink">
          primary=&quot;plum&quot; secondary=&quot;pink&quot;
        </Link>
      </p>
    </div>
  )
}

import { Ground } from '@fairgarden-private/design/components/Ground'
import { Link } from '@fairgarden-private/design/components/Link'
import { Separator } from '@fairgarden-private/design/components/Separator'
import styles from './overrides.module.css'

export function GroundOverrides() {
  return (
    <div className={styles.row}>
      <Ground preset="paper" kind="face" className={styles.face}>
        <span className={styles.head}>Defaults</span>
        <Separator />
        <Link href="#overrides">olive × green</Link>
      </Ground>
      <Ground preset="paper" secondary="indigo" kind="face" className={styles.face}>
        <span className={styles.head}>secondary=&quot;indigo&quot;</span>
        <Separator />
        <Link href="#overrides">olive × indigo</Link>
      </Ground>
      <Ground preset="paper" primary="slate" secondary="amber" kind="face" className={styles.face}>
        <span className={styles.head}>primary=&quot;slate&quot;</span>
        <Separator />
        <Link href="#overrides">slate × amber</Link>
      </Ground>
    </div>
  )
}

import { Link } from '@fairgarden-private/design/components/Link'
import styles from './kinds.module.css'

export function LinkKinds() {
  return (
    <div className={styles.stack}>
      <p className={styles.text}>
        Read the <Link href="#kinds">trail conditions</Link> before you set out.
      </p>
      <Link kind="standalone" href="#kinds">
        See all trails
      </Link>
      <nav className={styles.nav} aria-label="Example navigation">
        <Link kind="nav" href="#kinds" data-active="">
          Trails
        </Link>
        <Link kind="nav" href="#kinds">
          Maps
        </Link>
        <Link kind="nav" href="#kinds">
          Events
        </Link>
      </nav>
      <ul className={styles.list} aria-label="Example list links">
        <li>
          <Link kind="nav" list href="#kinds">
            Trail maps
          </Link>
        </li>
        <li>
          <Link kind="nav" list href="#kinds">
            Volunteer days
          </Link>
        </li>
      </ul>
      <nav className={styles.nav} aria-label="Example muted links">
        <Link kind="nav" muted href="#kinds">
          Guides
        </Link>
        <Link kind="nav" muted href="#kinds">
          Trail care
        </Link>
      </nav>
      <p className={styles.text}>
        Elevation data from the{' '}
        <Link href="https://www.usgs.gov" external>
          USGS
        </Link>
        .
      </p>
    </div>
  )
}

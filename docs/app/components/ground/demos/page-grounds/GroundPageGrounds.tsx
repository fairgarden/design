import { Button } from '@fairgarden-private/design/components/Button'
import { Ground } from '@fairgarden-private/design/components/Ground'
import { Link } from '@fairgarden-private/design/components/Link'
import styles from './page-grounds.module.css'

const pageGrounds = [
  'paper',
  'white',
  'tide',
  'meadow',
  'pollen',
  'apricot',
  'rose',
  'heather',
] as const

const modes = ['light', 'dark'] as const

/**
 * The eight page grounds follow the page mode, painting the same step in
 * both: paper and white, and the six step-3 pastels (a pastel in light
 * mode, a rich near-black in dark mode). Each shows its section head
 * (--role-heading), a body link (--role-accent underline, --role-link-hover
 * on hover) and the amber action.
 *
 * Preview only: each row forces its mode with `data-theme` on a wrapper,
 * which a product sets only on `html`, from the app shell.
 */
export function GroundPageGrounds() {
  return (
    <div className={styles.modes}>
      {modes.map((mode) => (
        <div key={mode} data-theme={mode} className={styles.mode}>
          <p className={styles.modeName}>{mode === 'light' ? 'Light mode' : 'Dark mode'}</p>
          <div className={styles.grid}>
            {pageGrounds.map((preset) => (
              <Ground key={preset} kind="face" preset={preset} className={styles.face}>
                <span className={styles.name}>{preset}</span>
                <Link href="#page-grounds">Field notes</Link>
                <div>
                  <Button variant="solid" size="sm">
                    Join
                  </Button>
                </div>
              </Ground>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

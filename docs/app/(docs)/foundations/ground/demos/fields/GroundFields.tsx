import { Button } from '@fairgarden/design/actions/button'
import { Ground } from '@fairgarden/design/foundations/ground'
import { Link } from '@fairgarden/design/actions/link'
import styles from './fields.module.css'

const fields = ['forest', 'royal', 'brick', 'leaf', 'amber', 'clay', 'pink'] as const

/**
 * The seven fields: inset, fixed-mode surfaces with a radius and their own
 * --primary12 edge, never full-bleed. Forest, royal and brick stay dark and
 * leaf, amber, clay and pink stay light in both page modes. The solid
 * fields carry one ink: the action becomes the ink pill and the link hover
 * adds an underline.
 */
export function GroundFields() {
  return (
    <div className={styles.grid}>
      {fields.map((preset) => (
        <Ground key={preset} kind="field" preset={preset} className={styles.field}>
          <span className={styles.name}>{preset}</span>
          <Link href="#fields">Field notes</Link>
          <div>
            <Button variant="solid" size="sm">
              Join
            </Button>
          </div>
        </Ground>
      ))}
    </div>
  )
}

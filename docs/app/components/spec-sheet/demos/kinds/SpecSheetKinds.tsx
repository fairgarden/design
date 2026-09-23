import {
  SpecGridItem,
  SpecListItem,
  SpecSheet,
} from '@fairgarden-private/design/components/SpecSheet'
import styles from './kinds.module.css'

/** The leader list, the form box and the manual page. */
export function SpecSheetKinds() {
  return (
    <div className={styles.stack}>
      <SpecSheet kind="leader" heading="Bench, Oak" headingLevel={3}>
        <SpecListItem label="Width">180 cm (71 in)</SpecListItem>
        <SpecListItem label="Depth">45 cm (18 in)</SpecListItem>
        <SpecListItem label="Seat height">46 cm (18 in)</SpecListItem>
        <SpecListItem label="Finish">Oiled, food-safe</SpecListItem>
      </SpecSheet>
      <SpecSheet kind="form-box" heading="Survey Record" headingLevel={3}>
        <SpecGridItem label="Plot">B-14</SpecGridItem>
        <SpecGridItem label="Observer">A. Díaz</SpecGridItem>
        <SpecGridItem label="Date">22 Sept 2026</SpecGridItem>
        <SpecGridItem label="Cover" estimated>
          60%
        </SpecGridItem>
      </SpecSheet>
      <SpecSheet kind="manual" label="Menu item: Garden Plate">
        <p className={styles.title}>Garden Plate</p>
        <ol className={styles.steps}>
          <li>Roasted roots, warm</li>
          <li>Leaves from the east beds</li>
          <li>Seed crumble</li>
        </ol>
      </SpecSheet>
    </div>
  )
}

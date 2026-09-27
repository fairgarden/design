import { MorphPanel } from '../morph/ExpandingBoxMorph'
import styles from './pairs.module.css'

/** Two owners side by side: each takes its own name, so neither morph disturbs the other. */
export function ExpandingBoxPairs() {
  return (
    <div className={styles.row}>
      <MorphPanel label="Opening hours">
        <p>Gates open at 7:00 and close at dusk, 365 days a year.</p>
      </MorphPanel>
      <MorphPanel label="Parking" primary="plum">
        <p>The lower lot holds 40 cars; overflow parks on Mill Lane.</p>
      </MorphPanel>
    </div>
  )
}

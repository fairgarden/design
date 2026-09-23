import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from '@fairgarden-private/design/components/Collapsible'
import styles from './variants.module.css'

const preserves = ['Bluestem Prairie', 'Heron Marsh', 'Oak Hollow', 'Cedar Bluff']
const more = ['Fox Run', 'Willow Bend', 'Kettle Pond', 'Sandhill Flats']

/** "Show more" with a swapped open label, and a disabled trigger. */
export function CollapsibleVariants() {
  return (
    <div className={styles.stack}>
      <Collapsible>
        <ul className={styles.list}>
          {preserves.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <CollapsiblePanel>
          <ul className={styles.list}>
            {more.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </CollapsiblePanel>
        <CollapsibleTrigger openLabel="Show less">Show {more.length} more</CollapsibleTrigger>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger>Deed restrictions</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className={styles.copy}>No subdivision, no new structures, and no removal of native trees.</p>
        </CollapsiblePanel>
      </Collapsible>

      <Collapsible disabled>
        <CollapsibleTrigger>Survey records (unavailable)</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className={styles.copy}>Not shown.</p>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  )
}

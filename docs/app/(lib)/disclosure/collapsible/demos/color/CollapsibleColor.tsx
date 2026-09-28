import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from '@fairgarden/design/disclosure/collapsible'
import styles from './color.module.css'

/** `primary` drives the label, glyph and panel text. */
export function CollapsibleColor() {
  return (
    <div className={styles.row}>
      <Collapsible primary="plum">
        <CollapsibleTrigger openLabel="Hide details">Show details</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className={styles.copy}>Primary plum.</p>
        </CollapsiblePanel>
      </Collapsible>
      <Collapsible primary="bronze" defaultOpen>
        <CollapsibleTrigger openLabel="Hide details">Show details</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className={styles.copy}>Primary bronze, open.</p>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  )
}

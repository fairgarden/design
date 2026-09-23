import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from '@fairgarden-private/design/components/Collapsible'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** The glyph steps from muted to the text ink on paper; on forest both states are the one ink. */
export function CollapsibleGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Collapsible>
            <CollapsibleTrigger openLabel="Show less">Show 3 more</CollapsibleTrigger>
            <CollapsiblePanel>
              <p className={styles.copy}>Fox Run, Willow Bend, Kettle Pond.</p>
            </CollapsiblePanel>
          </Collapsible>
        </PresetGround>
      ))}
    </div>
  )
}

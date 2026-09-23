import { Accordion, AccordionItem } from '@fairgarden-private/design/components/Accordion'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** Pure type and line: on forest the collapsed glyph is already the one ink, so direction carries the state. */
export function AccordionGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Accordion defaultValue={['open']}>
            <AccordionItem value="open" title="Expanded">
              <p className={styles.copy}>Arrows point inward.</p>
            </AccordionItem>
            <AccordionItem value="closed" title="Collapsed">
              <p className={styles.copy}>Arrows point outward.</p>
            </AccordionItem>
          </Accordion>
        </PresetGround>
      ))}
    </div>
  )
}

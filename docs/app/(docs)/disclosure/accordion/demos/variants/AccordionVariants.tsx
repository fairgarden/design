import { Accordion, AccordionItem } from '@fairgarden/design/disclosure/accordion'
import styles from './variants.module.css'

/**
 * The ruled accordion with the disclosure glyph (default), the strong
 * top rule for an accordion that follows a heading, and the plus/minus
 * alternate.
 */
export function AccordionVariants() {
  return (
    <div className={styles.stack}>
      <Accordion defaultValue={['hours']}>
        <AccordionItem value="hours" title="Hours and seasons">
          <p className={styles.copy}>Open dawn to dusk every day. Boardwalks close after heavy frost.</p>
        </AccordionItem>
        <AccordionItem value="parking" title="Parking and transit">
          <p className={styles.copy}>Twelve spaces at the north lot; the 42 bus stops at the gate.</p>
        </AccordionItem>
        <AccordionItem value="rules" title="Preserve rules" disabled>
          <p className={styles.copy}>Unavailable while the page is updated.</p>
        </AccordionItem>
      </Accordion>

      <section className={styles.section}>
        <h3 className={styles.heading}>Trail notes</h3>
        <Accordion headed>
          <AccordionItem value="loop" title="Meadow loop, 1.2 miles">
            <p className={styles.copy}>Flat and accessible, with benches every quarter mile.</p>
          </AccordionItem>
          <AccordionItem value="ridge" title="Ridge trail, 3.4 miles">
            <p className={styles.copy}>Steep switchbacks; muddy in spring.</p>
          </AccordionItem>
        </Accordion>
      </section>

      <Accordion glyph="plusminus">
        <AccordionItem value="account" title="Account settings">
          <p className={styles.copy}>The plus/minus circle is the alternate for product UI.</p>
        </AccordionItem>
        <AccordionItem value="notifications" title="Notifications">
          <p className={styles.copy}>Never mix it with the disclosure glyph on one page.</p>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

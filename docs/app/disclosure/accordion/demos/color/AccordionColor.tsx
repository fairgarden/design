import { Accordion, AccordionItem } from '@fairgarden/design/disclosure/accordion'
import styles from './color.module.css'

/** `primary` drives every part: rules, titles, glyph and panel text. `secondary` is unused. */
export function AccordionColor() {
  return (
    <div className={styles.stack}>
      <Accordion primary="plum" defaultValue={['a']}>
        <AccordionItem value="a" title="Primary plum">
          <p className={styles.copy}>Rules, titles, glyph and panel text re-resolve together.</p>
        </AccordionItem>
        <AccordionItem value="b" title="Collapsed glyph">
          <p className={styles.copy}>The collapsed glyph is the muted step of the same scale.</p>
        </AccordionItem>
      </Accordion>
      <Accordion primary="slate" headed>
        <AccordionItem value="a" title="Primary slate, headed">
          <p className={styles.copy}>The strong top rule is the text step of the scale.</p>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

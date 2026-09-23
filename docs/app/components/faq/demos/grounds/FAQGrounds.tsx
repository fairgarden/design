import {
  FAQ,
  FAQContact,
  FAQHeader,
  FAQIntro,
  FAQItem,
  FAQList,
  FAQTitle,
} from '@fairgarden-private/design/components/FAQ'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** Light and deep grounds both hold an FAQ; the rules and glyph re-resolve per ground. */
export function FAQGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <FAQ>
            <FAQList defaultValue={['open']}>
              <FAQItem value="open" question="Are the trails open in winter?">
                Yes, except after ice storms.
              </FAQItem>
              <FAQItem value="restrooms" question="Are there restrooms?">
                At the north lot, May to October.
              </FAQItem>
            </FAQList>
          </FAQ>
        </PresetGround>
      ))}
    </div>
  )
}

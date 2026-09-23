import {
  FAQ,
  FAQContact,
  FAQHeader,
  FAQIntro,
  FAQItem,
  FAQList,
  FAQTitle,
} from '@fairgarden-private/design/components/FAQ'
import { Link } from '@fairgarden-private/design/components/Link'
import styles from './color.module.css'

/** `primary` drives rules, questions and glyph; `secondary` only the link underlines in answers. */
export function FAQColor() {
  return (
    <div className={styles.stack}>
      <FAQ primary="slate" secondary="indigo">
        <FAQHeader>
          <FAQTitle>Membership</FAQTitle>
        </FAQHeader>
        <FAQList defaultValue={['renew']}>
          <FAQItem value="renew" question="When does my membership renew?">
            Each spring. <Link href="#renew">Renew online</Link> any time after March 1.
          </FAQItem>
          <FAQItem value="gift" question="Can I give a membership as a gift?">
            Yes, with a printed card mailed to the recipient.
          </FAQItem>
        </FAQList>
      </FAQ>
    </div>
  )
}

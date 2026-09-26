import { Ground } from '@fairgarden/design/foundations/ground'
import {
  Quote,
  QuoteAttribution,
  QuoteName,
  QuoteRole,
  QuoteText,
} from '@fairgarden/design/content/quote'
import styles from './grounds.module.css'

/** Framed on a page ground and a deep field; saturated fields hold the band only, in one ink. */
export function QuoteGrounds() {
  return (
    <div className={styles.row}>
      <Ground kind="face" preset="paper" className={styles.face}>
        <p className={styles.name}>paper</p>
        <FramedQuote />
      </Ground>
      <Ground kind="field" preset="forest" className={styles.face}>
        <p className={styles.name}>forest field</p>
        <FramedQuote />
      </Ground>
      <Ground kind="field" preset="clay" className={styles.face}>
        <p className={styles.name}>clay field</p>
        <Quote kind="band">
          <QuoteText>
            <p>“Worth every early start.”</p>
          </QuoteText>
          <QuoteAttribution>
            <QuoteName>Mei Lin</QuoteName>
          </QuoteAttribution>
        </Quote>
      </Ground>
    </div>
  )
}

function FramedQuote() {
  return (
    <Quote kind="framed">
      <QuoteText>
        <p>Worth every early start.</p>
      </QuoteText>
      <QuoteAttribution>
        <QuoteName>Mei Lin</QuoteName>
        <QuoteRole>Member</QuoteRole>
      </QuoteAttribution>
    </Quote>
  )
}

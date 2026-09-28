import { AvatarFallback } from '@fairgarden/design/feedback/avatar'
import { Link } from '@fairgarden/design/actions/link'
import {
  Quote,
  QuoteAttribution,
  QuoteName,
  QuotePortrait,
  QuoteRole,
  QuoteSource,
  QuoteText,
} from '@fairgarden/design/content/quote'
import styles from './kinds.module.css'

/** Band and framed testimonials, a pull quote, a blockquote and an epigraph. */
export function QuoteKinds() {
  return (
    <div className={styles.stack}>
      <Quote kind="band">
        <QuoteText>
          <p>“I came for the owls and stayed for the people who count them.”</p>
        </QuoteText>
        <QuoteAttribution>
          <QuoteName>Ana Díaz</QuoteName>
          <QuoteRole>Volunteer since 2019</QuoteRole>
        </QuoteAttribution>
      </Quote>

      <Quote kind="framed">
        <QuoteText>
          <p>The crew days are the best three hours of my month.</p>
        </QuoteText>
        <QuoteAttribution>
          <QuotePortrait>
            <AvatarFallback>BO</AvatarFallback>
          </QuotePortrait>
          <QuoteName>Ben Okafor</QuoteName>
          <QuoteRole>Trail crew lead</QuoteRole>
        </QuoteAttribution>
      </Quote>

      <Quote kind="pull">
        <QuoteText>
          <p>“A meadow is a slow argument with the forest.”</p>
        </QuoteText>
      </Quote>

      <Quote kind="block">
        <QuoteText>
          <p>
            Burning in late winter keeps woody shrubs back and lets the prairie grasses take the
            light first.
          </p>
        </QuoteText>
        <QuoteAttribution>
          <QuoteSource>
            <Link href="#kinds">Prairie Management Handbook</Link>
          </QuoteSource>
        </QuoteAttribution>
      </Quote>

      <Quote kind="epigraph">
        <QuoteText>
          <p>Every trail is a promise to come back.</p>
        </QuoteText>
      </Quote>
    </div>
  )
}

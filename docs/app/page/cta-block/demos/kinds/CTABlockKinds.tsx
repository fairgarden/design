import { CTABlock } from '@fairgarden/design/page/cta-block'
import styles from './kinds.module.css'

/** A simple leaf mark for the blob mount, drawn in currentColor (the front disc's contrast ink). */
function LeafMark() {
  return (
    <svg className={styles.mark} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M10 38C10 20 22 9 40 8c0 18-11 30-29 30Z" />
      <path d="M10 38 28 20" />
    </svg>
  )
}

/**
 * The page-ground sunburst kind (its trail and sunburst drawn by default),
 * the mission kind on its blob mount, the deep forest field, the saturated
 * amber field and the framed box.
 */
export function CTABlockKinds() {
  return (
    <div className={styles.stack}>
      <CTABlock
        kicker="Keep exploring"
        headline="Find a land trust near you"
        action={{ label: 'Find a Land Trust', href: 'https://example.org/find' }}
      />
      <CTABlock
        kind="mission"
        mount={<LeafMark />}
        headline="We protect the places you love"
        support="Local land trusts work with their neighbors to keep farms, forests and trails open for good."
        action={{ label: 'Our Mission', href: 'https://example.org/mission' }}
      />
      <CTABlock
        kind="deep"
        headline="Become a member and protect the places you love"
        support="Members fund easements, stewardship and the trails you walk."
        action={{ label: 'Join Today', href: 'https://example.org/join' }}
        secondaryAction={{ label: 'Learn More', href: 'https://example.org/membership' }}
      />
      <CTABlock
        kind="saturated"
        headline="Plant 10,000 trees this spring"
        action={{ label: 'Give a Tree', href: 'https://example.org/trees' }}
      />
      <CTABlock
        kind="framed"
        headline="Request a survey of your land"
        action={{ label: 'Enquire', href: 'https://example.org/survey' }}
      />
    </div>
  )
}

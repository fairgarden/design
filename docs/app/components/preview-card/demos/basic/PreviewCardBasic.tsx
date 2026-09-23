'use client'

import {
  PreviewCard,
  PreviewCardArrow,
  PreviewCardDescription,
  PreviewCardDomain,
  PreviewCardPopup,
  PreviewCardThumb,
  PreviewCardTitle,
  PreviewCardTrigger,
} from '@fairgarden-private/design/components/PreviewCard'
import styles from './basic.module.css'

export function PreviewCardBasic() {
  return (
    <p className={styles.text}>
      From the saddle, the loop meets the{' '}
      <PreviewCard>
        <PreviewCardTrigger href="https://example.org/trails/ridge-connector">
          Ridge Connector
        </PreviewCardTrigger>
        <PreviewCardPopup>
          <PreviewCardArrow />
          <PreviewCardThumb
            render={
              <svg viewBox="0 0 160 90" role="img" aria-label="Map sketch of the Ridge Connector">
                <path className={styles.ridge} d="M0 72 40 44l30 16 40-36 50 34" />
                <path className={styles.trail} d="M12 78c30-10 44-30 70-30s40-18 66-28" />
              </svg>
            }
            className={styles.thumb}
          />
          <PreviewCardTitle>Ridge Connector</PreviewCardTitle>
          <PreviewCardDescription>A 2.1 km link from the saddle to the reservoir dam.</PreviewCardDescription>
          <PreviewCardDomain>example.org</PreviewCardDomain>
        </PreviewCardPopup>
      </PreviewCard>{' '}
      and drops to the reservoir. Hover the link with a mouse to preview it; on touch it simply
      navigates.
    </p>
  )
}

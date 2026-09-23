import { Ground } from '@fairgarden-private/design/components/Ground'
import { SectionDivider } from '@fairgarden-private/design/components/SectionDivider'
import { SectionHeader } from '@fairgarden-private/design/components/SectionHeader'
import styles from './grounds.module.css'

/** The editorial header on tide, the trail kicker on paper, and a header in the night footer. */
export function SectionHeaderGrounds() {
  return (
    <div className={styles.page}>
      <Ground kind="band" preset="tide" className={styles.band} aria-labelledby="grounds-tide">
        <div className={styles.container}>
          <SectionHeader
            eyebrow="Stories"
            heading="Rivers coming back"
            headingId="grounds-tide"
            lede="Three watersheds, ten years of work, and what the water says now."
            seeAll={{ href: '#grounds', label: 'See all stories' }}
          />
        </div>
      </Ground>
      <Ground kind="band" preset="paper" className={styles.band}>
        <SectionDivider kind="page-seam" />
        <div className={styles.container}>
          <SectionHeader
            kind="trailed"
            kicker="Next"
            heading="Visit a preserve near you"
            seeAll={{ href: '#grounds', label: 'See all preserves' }}
          />
        </div>
      </Ground>
      <Ground kind="band" preset="night" render={<footer />} className={styles.band}>
        <div className={styles.container}>
          <SectionHeader
            eyebrow="Stay in touch"
            heading="The field notes letter"
            lede="On the night band every text takes the light ink; the trail and underlines stay green."
            seeAll={{ href: '#grounds' }}
          />
        </div>
      </Ground>
    </div>
  )
}

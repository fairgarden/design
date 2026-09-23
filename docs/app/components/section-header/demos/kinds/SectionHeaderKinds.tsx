import { Button } from '@fairgarden-private/design/components/Button'
import { Ground } from '@fairgarden-private/design/components/Ground'
import { SectionHeader } from '@fairgarden-private/design/components/SectionHeader'
import { Tag } from '@fairgarden-private/design/components/Tag'
import { Sticker } from '../sticker'
import styles from './kinds.module.css'

/** The six openers on one paper band. */
export function SectionHeaderKinds() {
  return (
    <Ground kind="band" preset="paper" className={styles.band}>
      <div className={styles.container}>
        <SectionHeader
          eyebrow="Field guide"
          heading="Birds of the tallgrass prairie"
          lede="Forty species nest in the grass itself; here is how to find them."
        />
        <SectionHeader kind="trailed" kicker="Keep exploring" heading="More from the trail" />
        <SectionHeader
          kind="scene"
          heading="Every acre counts"
          lede="Join the neighbors who keep this land open for good."
        >
          <Button variant="solid" size="lg">
            Donate Now
          </Button>
        </SectionHeader>
        <SectionHeader kind="anchored" art={<Sticker />} heading="Our kitchen garden">
          <Button>See the Menu</Button>
        </SectionHeader>
        <SectionHeader
          kind="technical"
          number="03"
          eyebrow="Specifications"
          heading="Dimensions and weight"
          level="module"
        />
        <SectionHeader kind="topic" topic={<Tag>Conservation</Tag>} heading="Protecting working land" />
      </div>
    </Ground>
  )
}

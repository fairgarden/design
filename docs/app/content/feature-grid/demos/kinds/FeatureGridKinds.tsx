import {
  FeatureGrid,
  FeatureGridBody,
  FeatureGridCell,
  FeatureGridHeading,
  FeatureGridIcon,
  FeatureGridLink,
  FeatureGridList,
} from '@fairgarden/design/content/feature-grid'
import { Icon } from '@fairgarden/design/foundations/icon'
import styles from './kinds.module.css'

const ways = [
  { icon: 'search', title: 'Find a trail', body: 'Search 40 preserves by distance, terrain and dogs allowed.' },
  { icon: 'download', title: 'Take the map', body: 'Download printable maps that work without a signal.' },
  { icon: 'help', title: 'Ask a steward', body: 'Our stewards answer questions within two days.' },
] as const

const steps = [
  { title: 'Pick a date', body: 'Crew days run every second Saturday.' },
  { title: 'Bring gloves', body: 'We supply tools, water and snacks.' },
  { title: 'Meet at the kiosk', body: 'We start at nine and finish by noon.' },
]

/** Icon (default), numbered, rule-topped and framed grids. */
export function FeatureGridKinds() {
  return (
    <div className={styles.stack}>
      <FeatureGrid header={{ eyebrow: 'Visit', heading: 'Plan your walk' }}>
        <FeatureGridList>
          {ways.map((way) => (
            <FeatureGridCell key={way.title}>
              <FeatureGridIcon>
                <Icon name={way.icon} size="block" />
              </FeatureGridIcon>
              <FeatureGridHeading>
                <FeatureGridLink href="#kinds">{way.title}</FeatureGridLink>
              </FeatureGridHeading>
              <FeatureGridBody>{way.body}</FeatureGridBody>
            </FeatureGridCell>
          ))}
        </FeatureGridList>
      </FeatureGrid>

      <FeatureGrid kind="numbered">
        <FeatureGridList>
          {steps.map((step) => (
            <FeatureGridCell key={step.title}>
              <FeatureGridHeading>{step.title}</FeatureGridHeading>
              <FeatureGridBody>{step.body}</FeatureGridBody>
            </FeatureGridCell>
          ))}
        </FeatureGridList>
      </FeatureGrid>

      <FeatureGrid kind="rule-topped">
        <FeatureGridList>
          {steps.map((step) => (
            <FeatureGridCell key={step.title}>
              <FeatureGridHeading>{step.title}</FeatureGridHeading>
              <FeatureGridBody>{step.body}</FeatureGridBody>
            </FeatureGridCell>
          ))}
        </FeatureGridList>
      </FeatureGrid>

      <FeatureGrid kind="framed">
        <FeatureGridList>
          {['Quiet', 'Shaded', 'Level', 'Open daily'].map((title) => (
            <FeatureGridCell key={title}>
              <FeatureGridHeading>{title}</FeatureGridHeading>
              <FeatureGridBody>One sentence on what it means for your visit.</FeatureGridBody>
            </FeatureGridCell>
          ))}
        </FeatureGridList>
      </FeatureGrid>
    </div>
  )
}

import { Button } from '@fairgarden-private/design/components/Button'
import {
  Pricing,
  PricingAction,
  PricingAmount,
  PricingAsOf,
  PricingCell,
  PricingChoice,
  PricingCurrency,
  PricingFeature,
  PricingFeatures,
  PricingMatrix,
  PricingPeriod,
  PricingPrice,
  PricingSummary,
  PricingTier,
  PricingTierList,
  PricingTierName,
} from '@fairgarden-private/design/components/Pricing'
import { Radio } from '@fairgarden-private/design/components/Radio'
import { RadioGroup } from '@fairgarden-private/design/components/RadioGroup'
import styles from './tiers.module.css'

const tiers = [
  {
    value: 'steward',
    name: 'Steward',
    amount: '120',
    summary: 'For regulars who want to give back.',
    features: ['Everything in Member', 'Two guided walks', 'Crew-day priority'],
    recommended: true,
  },
  {
    value: 'member',
    name: 'Member',
    amount: '45',
    summary: 'Free parking and the quarterly newsletter.',
    features: ['Free parking', 'Quarterly newsletter'],
  },
  {
    value: 'patron',
    name: 'Patron',
    amount: '500',
    summary: 'Sold out for this season.',
    features: ['Everything in Steward', 'Annual preserve tour'],
    unavailable: true,
  },
]

/** A membership tier set chosen with a Radio group, then a wholesale matrix. */
export function PricingTiers() {
  return (
    <div className={styles.stack}>
      <Pricing kind="tiers">
        <RadioGroup aria-label="Membership level" defaultValue="steward">
          <PricingTierList>
            {tiers.map((tier) => (
              <PricingTier key={tier.value} recommended={tier.recommended}>
                <PricingTierName>{tier.name}</PricingTierName>
                <PricingPrice value={tier.amount}>
                  <PricingCurrency>$</PricingCurrency>
                  <PricingAmount>{tier.amount}</PricingAmount>
                  <PricingPeriod>/ year</PricingPeriod>
                </PricingPrice>
                <PricingSummary>{tier.summary}</PricingSummary>
                <PricingFeatures>
                  {tier.features.map((feature) => (
                    <PricingFeature key={feature}>{feature}</PricingFeature>
                  ))}
                </PricingFeatures>
                <PricingChoice>
                  <Radio value={tier.value} disabled={tier.unavailable}>
                    Choose {tier.name}
                  </Radio>
                </PricingChoice>
                {tier.unavailable ? <PricingAction>Unavailable</PricingAction> : null}
              </PricingTier>
            ))}
          </PricingTierList>
        </RadioGroup>
        <PricingAsOf>Prices as of 1 Sep 2026 (hemlockravine.org/join)</PricingAsOf>
      </Pricing>

      <Pricing kind="matrix">
        <PricingMatrix label="Seedling prices">
          <thead>
            <tr>
              <th scope="col">Species</th>
              <th scope="col">Retail</th>
              <th scope="col">Wholesale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Pawpaw</th>
              <PricingCell label="Retail">$18</PricingCell>
              <PricingCell label="Wholesale">$11</PricingCell>
            </tr>
            <tr>
              <th scope="row">Serviceberry</th>
              <PricingCell label="Retail">$14</PricingCell>
              <PricingCell label="Wholesale">$9</PricingCell>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Minimum order</th>
              <PricingCell label="Retail">1</PricingCell>
              <PricingCell label="Wholesale">25</PricingCell>
            </tr>
          </tfoot>
        </PricingMatrix>
      </Pricing>

      <Button variant="solid">Join Now</Button>
    </div>
  )
}

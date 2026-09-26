import {
  Pricing,
  PricingAmount,
  PricingCents,
  PricingCurrency,
  PricingPeriod,
  PricingPrice,
  PricingQualifier,
  PricingSave,
  PricingStruck,
} from '@fairgarden/design/content/pricing'
import styles from './prices.module.css'

/** Inline in running text, a sale (struck price, current price, the saving as a word) and a menu figure. */
export function PricingPrices() {
  return (
    <div className={styles.stack}>
      <p className={styles.copy}>
        Guided walks{' '}
        <Pricing kind="inline" render={<span />}>
          <PricingPrice value="12">
            <PricingQualifier>from</PricingQualifier> <PricingCurrency>$</PricingCurrency>
            <PricingAmount>12</PricingAmount>
            <PricingPeriod>per person</PricingPeriod>
          </PricingPrice>
        </Pricing>
        , children free.
      </p>

      <Pricing kind="sale">
        <PricingStruck>
          <PricingPrice value="480">
            <PricingCurrency>$</PricingCurrency>
            <PricingAmount>480</PricingAmount>
          </PricingPrice>
        </PricingStruck>
        <PricingPrice value="180" label="Now">
          <PricingCurrency>$</PricingCurrency>
          <PricingAmount>180</PricingAmount>
        </PricingPrice>
        <PricingSave>Save $300</PricingSave>
      </Pricing>

      <Pricing kind="menu">
        <PricingPrice value="4.50">
          <PricingCurrency>$</PricingCurrency>
          <PricingAmount>4</PricingAmount>
          <PricingCents>50</PricingCents>
        </PricingPrice>
      </Pricing>
    </div>
  )
}

import { createMultipleTypes } from '@/functions/createTypes';
import {
  Pricing,
  PricingPrice,
  PricingQualifier,
  PricingCurrency,
  PricingAmount,
  PricingCents,
  PricingPeriod,
  PricingStruck,
  PricingSave,
  PricingTierList,
  PricingTier,
  PricingTierName,
  PricingSummary,
  PricingFeatures,
  PricingFeature,
  PricingChoice,
  PricingAction,
  PricingMatrix,
  PricingCell,
  PricingAsOf,
} from '@fairgarden/design/content/pricing';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Pricing,
  PricingPrice,
  PricingQualifier,
  PricingCurrency,
  PricingAmount,
  PricingCents,
  PricingPeriod,
  PricingStruck,
  PricingSave,
  PricingTierList,
  PricingTier,
  PricingTierName,
  PricingSummary,
  PricingFeatures,
  PricingFeature,
  PricingChoice,
  PricingAction,
  PricingMatrix,
  PricingCell,
  PricingAsOf,
});

export const TypesPricing = types;
export const TypesPricingAdditional = AdditionalTypes;

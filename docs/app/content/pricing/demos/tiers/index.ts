import { createDemo } from '@/functions/createDemo';
import { PricingTiers } from './PricingTiers';

export const DemoPricingTiers = createDemo(import.meta.url, PricingTiers, {
  name: 'Tiers and matrix',
  slug: 'tiers',
});

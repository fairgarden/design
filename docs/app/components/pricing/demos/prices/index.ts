import { createDemo } from '@/functions/createDemo';
import { PricingPrices } from './PricingPrices';

export const DemoPricingPrices = createDemo(import.meta.url, PricingPrices, {
  name: 'Inline, sale and menu prices',
  slug: 'prices',
});

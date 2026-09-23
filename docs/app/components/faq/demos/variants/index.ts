import { createDemo } from '@/functions/createDemo';
import { FAQVariants } from './FAQVariants';

export const DemoFAQVariants = createDemo(import.meta.url, FAQVariants, {
  name: 'Ruled and barred',
  slug: 'variants',
});

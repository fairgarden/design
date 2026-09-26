import { createDemo } from '@/functions/createDemo';
import { TabsVariants } from './TabsVariants';

export const DemoTabsVariants = createDemo(import.meta.url, TabsVariants, {
  name: 'Underline and segmented',
  slug: 'variants',
});

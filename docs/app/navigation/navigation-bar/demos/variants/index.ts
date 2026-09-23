import { createDemo } from '@/functions/createDemo';
import { NavigationBarVariants } from './NavigationBarVariants';

export const DemoNavigationBarVariants = createDemo(import.meta.url, NavigationBarVariants, {
  name: 'Ruled, masthead and compact',
  slug: 'variants',
});

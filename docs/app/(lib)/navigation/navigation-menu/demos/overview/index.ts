import { createDemo } from '@/functions/createDemo';
import { NavigationMenuOverview } from './NavigationMenuOverview';

export const DemoNavigationMenuOverview = createDemo(import.meta.url, NavigationMenuOverview, {
  name: 'Overview panels',
  slug: 'overview',
});

import { createDemo } from '@/functions/createDemo';
import { NavigationMenuIndex } from './NavigationMenuIndex';

export const DemoNavigationMenuIndex = createDemo(import.meta.url, NavigationMenuIndex, {
  name: 'Index panels',
  slug: 'index-panel',
});

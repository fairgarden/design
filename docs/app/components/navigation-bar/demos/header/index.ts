import { createDemo } from '@/functions/createDemo';
import { NavigationBarHeader } from './NavigationBarHeader';

export const DemoNavigationBarHeader = createDemo(import.meta.url, NavigationBarHeader, {
  name: 'The site header',
  slug: 'header',
});

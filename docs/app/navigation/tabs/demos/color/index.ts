import { createDemo } from '@/functions/createDemo';
import { TabsColor } from './TabsColor';

export const DemoTabsColor = createDemo(import.meta.url, TabsColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

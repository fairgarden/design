import { createDemo } from '@/functions/createDemo';
import { MenubarBasic } from './MenubarBasic';

export const DemoMenubarBasic = createDemo(import.meta.url, MenubarBasic, {
  name: 'An application menubar',
  slug: 'basic',
});

import { createDemo } from '@/functions/createDemo';
import { FileTabsLinks } from './FileTabsLinks';

export const DemoFileTabsLinks = createDemo(import.meta.url, FileTabsLinks, {
  name: 'Deep links',
  slug: 'links',
});

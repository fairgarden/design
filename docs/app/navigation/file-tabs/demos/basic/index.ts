import { createDemo } from '@/functions/createDemo';
import { FileTabsBasic } from './FileTabsBasic';

export const DemoFileTabsBasic = createDemo(import.meta.url, FileTabsBasic, {
  name: 'Files',
  slug: 'basic',
});

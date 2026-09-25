import { createDemo } from '@/functions/createDemo';
import { FileTabsOverflow } from './FileTabsOverflow';

export const DemoFileTabsOverflow = createDemo(import.meta.url, FileTabsOverflow, {
  name: 'Many files',
  slug: 'overflow',
});

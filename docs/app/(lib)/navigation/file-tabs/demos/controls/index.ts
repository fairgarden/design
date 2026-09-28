import { createDemo } from '@/functions/createDemo';
import { FileTabsControls } from './FileTabsControls';

export const DemoFileTabsControls = createDemo(import.meta.url, FileTabsControls, {
  name: 'Controls',
  slug: 'controls',
});

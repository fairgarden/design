import { createDemo } from '@/functions/createDemo';
import { FileTabsDisabled } from './FileTabsDisabled';

export const DemoFileTabsDisabled = createDemo(import.meta.url, FileTabsDisabled, {
  name: 'Disabled',
  slug: 'disabled',
});

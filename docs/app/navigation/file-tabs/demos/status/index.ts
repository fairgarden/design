import { createDemo } from '@/functions/createDemo';
import { FileTabsStatus } from './FileTabsStatus';

export const DemoFileTabsStatus = createDemo(import.meta.url, FileTabsStatus, {
  name: 'Status',
  slug: 'status',
});

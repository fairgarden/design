import { createDemo } from '@/functions/createDemo';
import { FileTabsFrames } from './FileTabsFrames';

export const DemoFileTabsFrames = createDemo(import.meta.url, FileTabsFrames, {
  name: 'Frames',
  slug: 'frames',
});

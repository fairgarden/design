import { createDemo } from '@/functions/createDemo';
import { CodeBlockFiles } from './CodeBlockFiles';

export const DemoCodeBlockFiles = createDemo(import.meta.url, CodeBlockFiles, {
  name: 'Files',
  slug: 'files',
});

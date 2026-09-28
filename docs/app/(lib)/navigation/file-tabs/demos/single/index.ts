import { createDemo } from '@/functions/createDemo';
import { FileTabsSingle } from './FileTabsSingle';

export const DemoFileTabsSingle = createDemo(import.meta.url, FileTabsSingle, {
  name: 'One document',
  slug: 'single',
});

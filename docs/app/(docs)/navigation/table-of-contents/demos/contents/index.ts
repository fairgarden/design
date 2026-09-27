import { createDemo } from '@/functions/createDemo';
import { TableOfContentsBasic } from './TableOfContentsBasic';

export const DemoTableOfContentsBasic = createDemo(import.meta.url, TableOfContentsBasic, {
  name: 'On this page',
  slug: 'contents',
});

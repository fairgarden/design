import { createDemo } from '@/functions/createDemo';
import { TableOfContentsBar } from './TableOfContentsBar';

export const DemoTableOfContentsBar = createDemo(import.meta.url, TableOfContentsBar, {
  name: 'The compact bar',
  slug: 'bar',
});

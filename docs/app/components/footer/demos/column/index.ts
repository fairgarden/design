import { createDemo } from '@/functions/createDemo';
import { FooterColumn } from './FooterColumn';

export const DemoFooterColumn = createDemo(import.meta.url, FooterColumn, {
  name: 'Newsletter column, ruled and minimal',
  slug: 'column',
});

import { createDemo } from '@/functions/createDemo';
import { ContextMenuBasic } from './ContextMenuBasic';

export const DemoContextMenuBasic = createDemo(import.meta.url, ContextMenuBasic, {
  name: 'Rows with a context menu',
  slug: 'basic',
});

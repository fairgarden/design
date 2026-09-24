import { createDemo } from '@/functions/createDemo';
import { SearchDialogBasic } from './SearchDialogBasic';

export const DemoSearchDialogBasic = createDemo(import.meta.url, SearchDialogBasic, {
  name: 'Searching these docs',
  slug: 'basic',
});

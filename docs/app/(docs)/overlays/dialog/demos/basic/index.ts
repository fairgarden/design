import { createDemo } from '@/functions/createDemo';
import { DialogBasic } from './DialogBasic';

export const DemoDialogBasic = createDemo(import.meta.url, DialogBasic, {
  name: 'A focused task',
  slug: 'basic',
});

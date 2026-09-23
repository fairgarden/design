import { createDemo } from '@/functions/createDemo';
import { DialogCover } from './DialogCover';

export const DemoDialogCover = createDemo(import.meta.url, DialogCover, {
  name: 'Wide, with a solid cover',
  slug: 'cover',
});

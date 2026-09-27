import { createDemo } from '@/functions/createDemo';
import { StickerSizes } from './StickerSizes';

export const DemoStickerSizes = createDemo(import.meta.url, StickerSizes, {
  name: 'Sizes and the bare variant',
  slug: 'sizes',
});

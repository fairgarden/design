import { createDemo } from '@/functions/createDemo';
import { ChipRemovable } from './ChipRemovable';

export const DemoChipRemovable = createDemo(import.meta.url, ChipRemovable, {
  name: 'Removable chips',
  slug: 'removable',
});

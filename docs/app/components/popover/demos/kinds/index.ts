import { createDemo } from '@/functions/createDemo';
import { PopoverKinds } from './PopoverKinds';

export const DemoPopoverKinds = createDemo(import.meta.url, PopoverKinds, {
  name: 'Panel and definition',
  slug: 'kinds',
});

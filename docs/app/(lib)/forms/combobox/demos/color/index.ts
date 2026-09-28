import { createDemo } from '@/functions/createDemo';
import { ComboboxColor } from './ComboboxColor';

export const DemoComboboxColor = createDemo(import.meta.url, ComboboxColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

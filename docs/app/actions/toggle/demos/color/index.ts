import { createDemo } from '@/functions/createDemo';
import { ToggleColor } from './ToggleColor';

export const DemoToggleColor = createDemo(import.meta.url, ToggleColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

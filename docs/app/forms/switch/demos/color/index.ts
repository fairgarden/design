import { createDemo } from '@/functions/createDemo';
import { SwitchColor } from './SwitchColor';

export const DemoSwitchColor = createDemo(import.meta.url, SwitchColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

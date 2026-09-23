import { createDemo } from '@/functions/createDemo';
import { ButtonColor } from './ButtonColor';

export const DemoButtonColor = createDemo(import.meta.url, ButtonColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

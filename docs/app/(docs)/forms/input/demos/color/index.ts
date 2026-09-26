import { createDemo } from '@/functions/createDemo';
import { InputColor } from './InputColor';

export const DemoInputColor = createDemo(import.meta.url, InputColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

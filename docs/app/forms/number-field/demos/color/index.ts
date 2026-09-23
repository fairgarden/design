import { createDemo } from '@/functions/createDemo';
import { NumberFieldColor } from './NumberFieldColor';

export const DemoNumberFieldColor = createDemo(import.meta.url, NumberFieldColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

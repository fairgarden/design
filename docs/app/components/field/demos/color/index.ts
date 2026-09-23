import { createDemo } from '@/functions/createDemo';
import { FieldColor } from './FieldColor';

export const DemoFieldColor = createDemo(import.meta.url, FieldColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

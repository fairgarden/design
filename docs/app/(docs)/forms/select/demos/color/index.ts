import { createDemo } from '@/functions/createDemo';
import { SelectColor } from './SelectColor';

export const DemoSelectColor = createDemo(import.meta.url, SelectColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

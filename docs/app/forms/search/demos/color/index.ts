import { createDemo } from '@/functions/createDemo';
import { SearchColor } from './SearchColor';

export const DemoSearchColor = createDemo(import.meta.url, SearchColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

import { createDemo } from '@/functions/createDemo';
import { TagColor } from './TagColor';

export const DemoTagColor = createDemo(import.meta.url, TagColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

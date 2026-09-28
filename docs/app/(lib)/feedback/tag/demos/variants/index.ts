import { createDemo } from '@/functions/createDemo';
import { TagVariants } from './TagVariants';

export const DemoTagVariants = createDemo(import.meta.url, TagVariants, {
  name: 'Plain and linked',
  slug: 'variants',
});

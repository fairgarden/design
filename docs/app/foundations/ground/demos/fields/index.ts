import { createDemo } from '@/functions/createDemo';
import { GroundFields } from './GroundFields';

export const DemoGroundFields = createDemo(import.meta.url, GroundFields, {
  name: 'The seven fields',
  slug: 'fields',
});

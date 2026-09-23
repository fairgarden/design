import { createDemo } from '@/functions/createDemo';
import { GroundPageGrounds } from './GroundPageGrounds';

export const DemoGroundPageGrounds = createDemo(import.meta.url, GroundPageGrounds, {
  name: 'The eight page grounds, in both modes',
  slug: 'page-grounds',
});

import { createDemo } from '@/functions/createDemo';
import { GroundOverrides } from './GroundOverrides';

export const DemoGroundOverrides = createDemo(import.meta.url, GroundOverrides, {
  name: 'Overriding the scales',
  slug: 'overrides',
});

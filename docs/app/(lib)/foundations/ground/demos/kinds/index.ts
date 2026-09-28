import { createDemo } from '@/functions/createDemo';
import { GroundKinds } from './GroundKinds';

export const DemoGroundKinds = createDemo(import.meta.url, GroundKinds, {
  name: 'Band, field and face',
  slug: 'kinds',
});

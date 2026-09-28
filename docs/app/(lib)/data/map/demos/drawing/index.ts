import { createDemo } from '@/functions/createDemo';
import { MapDrawn } from './MapDrawn';

export const DemoMapDrawn = createDemo(import.meta.url, MapDrawn, {
  name: 'A drawn garden map',
  slug: 'drawing',
});

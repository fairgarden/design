import { createDemo } from '@/functions/createDemo';
import { ExpandingBoxMorph } from './ExpandingBoxMorph';

export const DemoExpandingBoxMorph = createDemo(import.meta.url, ExpandingBoxMorph, {
  name: 'The morph',
  slug: 'morph',
});

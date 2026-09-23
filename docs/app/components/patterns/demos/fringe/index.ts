import { createDemo } from '@/functions/createDemo';
import { PatternFringe } from './PatternFringe';

export const DemoPatternFringe = createDemo(import.meta.url, PatternFringe, {
  name: 'Hatched fringe',
  slug: 'fringe',
});

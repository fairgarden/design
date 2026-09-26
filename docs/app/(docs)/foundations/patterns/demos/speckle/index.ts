import { createDemo } from '@/functions/createDemo';
import { PatternSpeckle } from './PatternSpeckle';

export const DemoPatternSpeckle = createDemo(import.meta.url, PatternSpeckle, {
  name: 'Speckled bands',
  slug: 'speckle',
});

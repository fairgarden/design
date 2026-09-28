import { createDemo } from '@/functions/createDemo';
import { PatternGrain } from './PatternGrain';

export const DemoPatternGrain = createDemo(import.meta.url, PatternGrain, {
  name: 'Grain on deep and saturated faces',
  slug: 'grain',
});

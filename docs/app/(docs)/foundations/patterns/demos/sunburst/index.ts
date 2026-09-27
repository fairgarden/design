import { createDemo } from '@/functions/createDemo';
import { PatternSunburst } from './PatternSunburst';

export const DemoPatternSunburst = createDemo(import.meta.url, PatternSunburst, {
  name: 'Sunburst band',
  slug: 'sunburst',
});

import { createDemo } from '@/functions/createDemo';
import { PatternOrnaments } from './PatternOrnaments';

export const DemoPatternOrnaments = createDemo(import.meta.url, PatternOrnaments, {
  name: 'Trail and markers',
  slug: 'ornaments',
});

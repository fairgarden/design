import { createDemo } from '@/functions/createDemo';
import { PatternDotgrid } from './PatternDotgrid';

export const DemoPatternDotgrid = createDemo(import.meta.url, PatternDotgrid, {
  name: 'Dot grid and dot field',
  slug: 'dotgrid',
});

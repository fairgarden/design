import { createDemo } from '@/functions/createDemo';
import { PatternAwning } from './PatternAwning';

export const DemoPatternAwning = createDemo(import.meta.url, PatternAwning, {
  name: 'Awning bands',
  slug: 'awning',
});

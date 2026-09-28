import { createDemo } from '@/functions/createDemo';
import { HeroStacked } from './HeroStacked';

export const DemoHeroStacked = createDemo(import.meta.url, HeroStacked, {
  name: 'C, stacked',
  slug: 'stacked',
});

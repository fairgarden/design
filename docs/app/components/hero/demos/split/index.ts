import { createDemo } from '@/functions/createDemo';
import { HeroSplit } from './HeroSplit';

export const DemoHeroSplit = createDemo(import.meta.url, HeroSplit, {
  name: 'Split photo',
  slug: 'split',
});

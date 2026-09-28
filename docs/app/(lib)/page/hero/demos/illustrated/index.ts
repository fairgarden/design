import { createDemo } from '@/functions/createDemo';
import { HeroIllustrated } from './HeroIllustrated';

export const DemoHeroIllustrated = createDemo(import.meta.url, HeroIllustrated, {
  name: 'Illustrated',
  slug: 'illustrated',
});

import { createDemo } from '@/functions/createDemo';
import { HeroEditorial } from './HeroEditorial';

export const DemoHeroEditorial = createDemo(import.meta.url, HeroEditorial, {
  name: 'Editorial and the media hero',
  slug: 'editorial',
});

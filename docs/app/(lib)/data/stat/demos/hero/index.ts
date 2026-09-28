import { createDemo } from '@/functions/createDemo';
import { StatHero } from './StatHero';

export const DemoStatHero = createDemo(import.meta.url, StatHero, {
  name: 'Hero and inline',
  slug: 'hero',
});

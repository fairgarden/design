import { createDemo } from '@/functions/createDemo';
import { HeroTechnical } from './HeroTechnical';

export const DemoHeroTechnical = createDemo(import.meta.url, HeroTechnical, {
  name: 'Technical',
  slug: 'technical',
});

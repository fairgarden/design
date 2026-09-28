import { createDemo } from '@/functions/createDemo';
import { CrewBanner } from './CrewBanner';

export const DemoDemoFramed = createDemo(import.meta.url, CrewBanner, {
  name: 'Custom preview',
  slug: 'framed',
});

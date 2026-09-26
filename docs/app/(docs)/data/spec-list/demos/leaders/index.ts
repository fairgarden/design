import { createDemo } from '@/functions/createDemo';
import { SpecListLeaders } from './SpecListLeaders';

export const DemoSpecListLeaders = createDemo(import.meta.url, SpecListLeaders, {
  name: 'Leaders',
  slug: 'leaders',
});

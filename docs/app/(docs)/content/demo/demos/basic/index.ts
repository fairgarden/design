import { createDemo } from '@/functions/createDemo';
import { JoinCrew } from './JoinCrew';

export const DemoDemoBasic = createDemo(import.meta.url, JoinCrew, {
  name: 'Basic',
  slug: 'basic',
});

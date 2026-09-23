import { createDemo } from '@/functions/createDemo';
import { ProfileTeamDemo } from './ProfileTeamDemo';

export const DemoProfileTeamDemo = createDemo(import.meta.url, ProfileTeamDemo, {
  name: 'Team',
  slug: 'team',
});

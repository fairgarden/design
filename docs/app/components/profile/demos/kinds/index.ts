import { createDemo } from '@/functions/createDemo';
import { ProfileKinds } from './ProfileKinds';

export const DemoProfileKinds = createDemo(import.meta.url, ProfileKinds, {
  name: 'Byline, author block and bio row',
  slug: 'kinds',
});

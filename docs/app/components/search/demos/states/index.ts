import { createDemo } from '@/functions/createDemo';
import { SearchKinds } from './SearchKinds';

export const DemoSearchKinds = createDemo(import.meta.url, SearchKinds, {
  name: 'Kinds and states',
  slug: 'states',
});

import { createDemo } from '@/functions/createDemo';
import { CardGridFiltered } from './CardGridFiltered';

export const DemoCardGridFiltered = createDemo(import.meta.url, CardGridFiltered, {
  name: 'Filtered, with a count',
  slug: 'filtered',
});

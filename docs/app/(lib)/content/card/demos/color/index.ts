import { createDemo } from '@/functions/createDemo';
import { CardColor } from './CardColor';

export const DemoCardColor = createDemo(import.meta.url, CardColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

import { createDemo } from '@/functions/createDemo';
import { MarqueeGrounds } from './MarqueeGrounds';

export const DemoMarqueeGrounds = createDemo(import.meta.url, MarqueeGrounds, {
  name: 'Field, page ground and ticker',
  slug: 'grounds',
});

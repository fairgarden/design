import { createDemo } from '@/functions/createDemo';
import { LinkColor } from './LinkColor';

export const DemoLinkColor = createDemo(import.meta.url, LinkColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

import { createDemo } from '@/functions/createDemo';
import { LinkKinds } from './LinkKinds';

export const DemoLinkKinds = createDemo(import.meta.url, LinkKinds, {
  name: 'Kinds',
  slug: 'kinds',
});

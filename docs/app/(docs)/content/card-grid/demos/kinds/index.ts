import { createDemo } from '@/functions/createDemo';
import { CardGridKinds } from './CardGridKinds';

export const DemoCardGridKinds = createDemo(import.meta.url, CardGridKinds, {
  name: 'Editorial and compact',
  slug: 'kinds',
});

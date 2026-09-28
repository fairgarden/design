import { createDemo } from '@/functions/createDemo';
import { CardKinds } from './CardKinds';

export const DemoCardKinds = createDemo(import.meta.url, CardKinds, {
  name: 'Kinds',
  slug: 'kinds',
});

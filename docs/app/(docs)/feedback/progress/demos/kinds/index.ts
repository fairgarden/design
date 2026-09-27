import { createDemo } from '@/functions/createDemo';
import { ProgressKinds } from './ProgressKinds';

export const DemoProgressKinds = createDemo(import.meta.url, ProgressKinds, {
  name: 'Kinds and states',
  slug: 'kinds',
});

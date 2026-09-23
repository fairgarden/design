import { createDemo } from '@/functions/createDemo';
import { FeatureGridKinds } from './FeatureGridKinds';

export const DemoFeatureGridKinds = createDemo(import.meta.url, FeatureGridKinds, {
  name: 'Kinds',
  slug: 'kinds',
});

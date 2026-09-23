import { createDemo } from '@/functions/createDemo';
import { MeterKinds } from './MeterKinds';

export const DemoMeterKinds = createDemo(import.meta.url, MeterKinds, {
  name: 'Kinds in a meter panel',
  slug: 'kinds',
});

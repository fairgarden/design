import { createDemo } from '@/functions/createDemo';
import { ChartSteps } from './ChartSteps';

export const DemoChartSteps = createDemo(import.meta.url, ChartSteps, {
  name: 'Sequential steps',
  slug: 'steps',
});

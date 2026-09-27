import { createDemo } from '@/functions/createDemo';
import { ChartAnimate } from './ChartAnimate';

export const DemoChartAnimate = createDemo(import.meta.url, ChartAnimate, {
  name: 'Opt-in entry animation',
  slug: 'animate',
});

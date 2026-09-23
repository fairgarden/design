import { createDemo } from '@/functions/createDemo';
import { ChartBars } from './ChartBars';

export const DemoChartBars = createDemo(import.meta.url, ChartBars, {
  name: 'Horizontal bars',
  slug: 'bars',
});

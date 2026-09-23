import { createDemo } from '@/functions/createDemo';
import { ChartLines } from './ChartLines';

export const DemoChartLines = createDemo(import.meta.url, ChartLines, {
  name: 'Lines and markers',
  slug: 'lines',
});

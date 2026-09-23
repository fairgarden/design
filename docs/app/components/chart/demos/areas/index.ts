import { createDemo } from '@/functions/createDemo';
import { ChartAreas } from './ChartAreas';

export const DemoChartAreas = createDemo(import.meta.url, ChartAreas, {
  name: 'Stacked areas',
  slug: 'areas',
});

import { createDemo } from '@/functions/createDemo';
import { ChartHighlight } from './ChartHighlight';

export const DemoChartHighlight = createDemo(import.meta.url, ChartHighlight, {
  name: 'Single highlight and one ink',
  slug: 'highlight',
});

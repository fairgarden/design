import { createDemo } from '@/functions/createDemo';
import { PlotTally } from './PlotTally';

export const DemoDemoCollapsible = createDemo(import.meta.url, PlotTally, {
  name: 'Collapsible code',
  slug: 'collapsible',
});

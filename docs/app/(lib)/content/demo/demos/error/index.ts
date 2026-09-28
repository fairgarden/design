import { createDemo } from '@/functions/createDemo';
import { PlotLabel } from './PlotLabel';
import { ReportedError } from './ReportedError';

export const DemoDemoError = createDemo(import.meta.url, PlotLabel, {
  name: 'Runtime error',
  slug: 'error',
  ClientProvider: ReportedError,
});

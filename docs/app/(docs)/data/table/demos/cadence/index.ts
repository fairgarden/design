import { createDemo } from '@/functions/createDemo';
import { TableCadence } from './TableCadence';

export const DemoTableCadence = createDemo(import.meta.url, TableCadence, {
  name: 'The five-row cadence',
  slug: 'cadence',
});

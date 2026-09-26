import { createDemo } from '@/functions/createDemo';
import { TableRecords } from './TableRecords';

export const DemoTableRecords = createDemo(import.meta.url, TableRecords, {
  name: 'Records, sorting and totals',
  slug: 'records',
});

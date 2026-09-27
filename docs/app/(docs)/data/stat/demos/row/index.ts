import { createDemo } from '@/functions/createDemo';
import { StatRow } from './StatRow';

export const DemoStatRow = createDemo(import.meta.url, StatRow, {
  name: 'Stat rows',
  slug: 'row',
});

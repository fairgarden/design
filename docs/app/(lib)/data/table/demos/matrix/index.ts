import { createDemo } from '@/functions/createDemo';
import { TableMatrix } from './TableMatrix';

export const DemoTableMatrix = createDemo(import.meta.url, TableMatrix, {
  name: 'A matrix with a pinned column',
  slug: 'matrix',
});

import { createDemo } from '@/functions/createDemo';
import { FormColor } from './FormColor';

export const DemoFormColor = createDemo(import.meta.url, FormColor, {
  name: 'Primary scale',
  slug: 'color',
});

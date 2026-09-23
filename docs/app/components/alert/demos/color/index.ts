import { createDemo } from '@/functions/createDemo';
import { AlertColor } from './AlertColor';

export const DemoAlertColor = createDemo(import.meta.url, AlertColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

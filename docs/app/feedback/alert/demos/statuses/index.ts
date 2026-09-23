import { createDemo } from '@/functions/createDemo';
import { AlertStatuses } from './AlertStatuses';

export const DemoAlertStatuses = createDemo(import.meta.url, AlertStatuses, {
  name: 'Statuses',
  slug: 'statuses',
});

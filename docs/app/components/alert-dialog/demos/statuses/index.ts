import { createDemo } from '@/functions/createDemo';
import { AlertDialogStatuses } from './AlertDialogStatuses';

export const DemoAlertDialogStatuses = createDemo(import.meta.url, AlertDialogStatuses, {
  name: 'Danger and warning',
  slug: 'statuses',
});

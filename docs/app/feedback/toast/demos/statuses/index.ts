import { createDemo } from '@/functions/createDemo';
import { ToastStatuses } from './ToastStatuses';

export const DemoToastStatuses = createDemo(import.meta.url, ToastStatuses, {
  name: 'Neutral, status and action toasts',
  slug: 'statuses',
});

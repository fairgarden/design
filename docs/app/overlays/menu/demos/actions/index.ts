import { createDemo } from '@/functions/createDemo';
import { MenuActions } from './MenuActions';

export const DemoMenuActions = createDemo(import.meta.url, MenuActions, {
  name: 'Action menu',
  slug: 'actions',
});

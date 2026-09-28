import { createDemo } from '@/functions/createDemo';
import { ToolbarKinds } from './ToolbarKinds';

export const DemoToolbarKinds = createDemo(import.meta.url, ToolbarKinds, {
  name: 'List and figure toolbars',
  slug: 'kinds',
});

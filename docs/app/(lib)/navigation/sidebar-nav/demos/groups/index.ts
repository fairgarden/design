import { createDemo } from '@/functions/createDemo';
import { SidebarNavGroups } from './SidebarNavGroups';

export const DemoSidebarNavGroups = createDemo(import.meta.url, SidebarNavGroups, {
  name: 'Groups and pages',
  slug: 'groups',
});

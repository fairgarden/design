import { createDemo } from '@/functions/createDemo';
import { FileTabsAgenda } from './FileTabsAgenda';

export const DemoFileTabsAgenda = createDemo(import.meta.url, FileTabsAgenda, {
  name: 'Agenda with attachments',
  slug: 'agenda',
});

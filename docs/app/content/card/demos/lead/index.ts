import { createDemo } from '@/functions/createDemo';
import { CardLead } from './CardLead';

export const DemoCardLead = createDemo(import.meta.url, CardLead, {
  name: 'Lead, pinned footers and unavailable',
  slug: 'lead',
});

import { createDemo } from '@/functions/createDemo';
import { TimelineAgenda } from './TimelineAgenda';

export const DemoTimelineAgenda = createDemo(import.meta.url, TimelineAgenda, {
  name: 'Agenda',
  slug: 'agenda',
});

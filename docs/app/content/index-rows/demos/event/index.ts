import { createDemo } from '@/functions/createDemo';
import { IndexRowsEvent } from './IndexRowsEvent';

export const DemoIndexRowsEvent = createDemo(import.meta.url, IndexRowsEvent, {
  name: 'Event index',
  slug: 'event',
});

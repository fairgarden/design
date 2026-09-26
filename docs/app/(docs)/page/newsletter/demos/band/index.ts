import { createDemo } from '@/functions/createDemo';
import { NewsletterBand } from './NewsletterBand';

export const DemoNewsletterBand = createDemo(import.meta.url, NewsletterBand, {
  name: 'Band and ruled row',
  slug: 'band',
});

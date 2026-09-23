import { createDemo } from '@/functions/createDemo';
import { NewsletterStraddle } from './NewsletterStraddle';

export const DemoNewsletterStraddle = createDemo(import.meta.url, NewsletterStraddle, {
  name: 'Straddle card',
  slug: 'straddle',
});

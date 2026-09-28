import { createDemo } from '@/functions/createDemo';
import { NewsletterInline } from './NewsletterInline';

export const DemoNewsletterInline = createDemo(import.meta.url, NewsletterInline, {
  name: 'Inline, in the footer',
  slug: 'inline',
});

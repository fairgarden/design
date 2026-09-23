import { createDemo } from '@/functions/createDemo';
import { FAQColor } from './FAQColor';

export const DemoFAQColor = createDemo(import.meta.url, FAQColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

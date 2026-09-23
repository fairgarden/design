import { createDemo } from '@/functions/createDemo';
import { FooterNavigation } from './FooterNavigation';

export const DemoFooterNavigation = createDemo(import.meta.url, FooterNavigation, {
  name: 'One navigation object for header, drawer and footer',
  slug: 'navigation',
});

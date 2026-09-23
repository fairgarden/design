import { createDemo } from '@/functions/createDemo';
import { FooterGuide } from './FooterGuide';

export const DemoFooterGuide = createDemo(import.meta.url, FooterGuide, {
  name: 'Field guide footer',
  slug: 'guide',
});

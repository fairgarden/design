import { createDemo } from '@/functions/createDemo';
import { MenuOptions } from './MenuOptions';

export const DemoMenuOptions = createDemo(import.meta.url, MenuOptions, {
  name: 'Sort and options, on forest',
  slug: 'options',
});

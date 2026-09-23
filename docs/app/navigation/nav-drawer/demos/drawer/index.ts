import { createDemo } from '@/functions/createDemo';
import { NavDrawerBasic } from './NavDrawerBasic';

export const DemoNavDrawerBasic = createDemo(import.meta.url, NavDrawerBasic, {
  name: 'The drawer',
  slug: 'drawer',
});

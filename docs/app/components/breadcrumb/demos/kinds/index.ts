import { createDemo } from '@/functions/createDemo';
import { BreadcrumbKinds } from './BreadcrumbKinds';

export const DemoBreadcrumbKinds = createDemo(import.meta.url, BreadcrumbKinds, {
  name: 'Inline, staircase and parent',
  slug: 'kinds',
});

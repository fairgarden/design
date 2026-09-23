import { createDemo } from '@/functions/createDemo';
import { BadgeColor } from './BadgeColor';

export const DemoBadgeColor = createDemo(import.meta.url, BadgeColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

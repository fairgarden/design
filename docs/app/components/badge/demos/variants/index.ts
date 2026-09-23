import { createDemo } from '@/functions/createDemo';
import { BadgeVariants } from './BadgeVariants';

export const DemoBadgeVariants = createDemo(import.meta.url, BadgeVariants, {
  name: 'Outline, pill, static fill, sticker, status and count',
  slug: 'variants',
});

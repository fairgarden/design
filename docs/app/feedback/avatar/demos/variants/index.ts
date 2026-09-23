import { createDemo } from '@/functions/createDemo';
import { AvatarVariants } from './AvatarVariants';

export const DemoAvatarVariants = createDemo(import.meta.url, AvatarVariants, {
  name: 'Sizes, initials, status and groups',
  slug: 'variants',
});

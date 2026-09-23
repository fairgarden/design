import { createDemo } from '@/functions/createDemo';
import { AvatarColor } from './AvatarColor';

export const DemoAvatarColor = createDemo(import.meta.url, AvatarColor, {
  name: 'Primary scale',
  slug: 'color',
});

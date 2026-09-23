import { createDemo } from '@/functions/createDemo';
import { ButtonDestructive } from './ButtonDestructive';

export const DemoButtonDestructive = createDemo(import.meta.url, ButtonDestructive, {
  name: 'Destructive actions are red',
  slug: 'destructive',
});

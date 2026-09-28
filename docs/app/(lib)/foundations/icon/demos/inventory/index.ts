import { createDemo } from '@/functions/createDemo';
import { IconInventory } from './IconInventory';

export const DemoIconInventory = createDemo(import.meta.url, IconInventory, {
  name: 'The inventory',
  slug: 'inventory',
});

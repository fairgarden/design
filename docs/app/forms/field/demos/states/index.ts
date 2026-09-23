import { createDemo } from '@/functions/createDemo';
import { FieldStates } from './FieldStates';

export const DemoFieldStates = createDemo(import.meta.url, FieldStates, {
  name: 'States',
  slug: 'states',
});

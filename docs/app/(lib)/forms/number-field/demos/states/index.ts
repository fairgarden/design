import { createDemo } from '@/functions/createDemo';
import { NumberFieldStates } from './NumberFieldStates';

export const DemoNumberFieldStates = createDemo(import.meta.url, NumberFieldStates, {
  name: 'Kinds and states',
  slug: 'states',
});

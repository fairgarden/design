import { createDemo } from '@/functions/createDemo';
import { FormStates } from './FormStates';

export const DemoFormStates = createDemo(import.meta.url, FormStates, {
  name: 'Summary, pairs and actions',
  slug: 'states',
});

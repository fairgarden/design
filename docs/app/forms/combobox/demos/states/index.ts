import { createDemo } from '@/functions/createDemo';
import { ComboboxStates } from './ComboboxStates';

export const DemoComboboxStates = createDemo(import.meta.url, ComboboxStates, {
  name: 'Single, multiple and states',
  slug: 'states',
});

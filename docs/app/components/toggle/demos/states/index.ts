import { createDemo } from '@/functions/createDemo';
import { ToggleStates } from './ToggleStates';

export const DemoToggleStates = createDemo(import.meta.url, ToggleStates, {
  name: 'Toggles and states',
  slug: 'states',
});

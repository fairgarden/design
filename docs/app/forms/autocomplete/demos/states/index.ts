import { createDemo } from '@/functions/createDemo';
import { AutocompleteStates } from './AutocompleteStates';

export const DemoAutocompleteStates = createDemo(import.meta.url, AutocompleteStates, {
  name: 'Suggestions and states',
  slug: 'states',
});

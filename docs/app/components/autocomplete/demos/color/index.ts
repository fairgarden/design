import { createDemo } from '@/functions/createDemo';
import { AutocompleteColor } from './AutocompleteColor';

export const DemoAutocompleteColor = createDemo(import.meta.url, AutocompleteColor, {
  name: 'Primary and secondary',
  slug: 'color',
});

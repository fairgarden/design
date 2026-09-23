import { createMultipleTypes } from '@/functions/createTypes';
import { Toggle } from '@fairgarden/design/actions/toggle';
import { ToggleGroup } from '@fairgarden/design/actions/toggle-group';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Toggle,
  ToggleGroup,
});

export const TypesToggle = types;
export const TypesToggleAdditional = AdditionalTypes;
